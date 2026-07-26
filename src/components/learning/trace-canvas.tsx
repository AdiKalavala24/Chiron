import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { runOnJS } from 'react-native-reanimated';
import { Check, RotateCcw, Undo2, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import type { TraceGuideMode, TracePayload } from '@/features/curriculum';

const CANVAS_SIZE = 260;
/** Points closer than this to the previous one are dropped — keeps stroke arrays small without visibly changing the line. */
const MIN_POINT_DISTANCE = 2;

export interface Point {
  x: number;
  y: number;
}

/** One continuous pen-down..pen-up movement. A glyph is a list of these. */
export type Stroke = Point[];

function strokeLength(stroke: Stroke): number {
  let total = 0;
  for (let i = 1; i < stroke.length; i++) {
    const dx = stroke[i].x - stroke[i - 1].x;
    const dy = stroke[i].y - stroke[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/**
 * Scores a coverage/length/stroke-count heuristic against everything the
 * kid drew. This is NOT real handwriting-shape recognition (that needs a
 * trained model, well outside what this pass can ship); it's a coarse but
 * honestly-computed proxy so tracing has real, responsive feedback
 * instead of an always-pass rubber stamp.
 *
 * Length is summed *per stroke*, never across the whole flattened point
 * list — otherwise the pen-up jump between two strokes would be counted
 * as ink the kid never drew, and lifting the pen would inflate the score.
 */
export function scoreTrace(strokes: readonly Stroke[], expectedStrokes?: number): number {
  // Single-point strokes count toward the stroke tally (the dot on an "i"
  // is a real stroke) but naturally contribute no length.
  const drawn = strokes.filter((s) => s.length >= 1);
  if (drawn.length === 0) return 0;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let totalLength = 0;

  for (const stroke of drawn) {
    totalLength += strokeLength(stroke);
    for (const p of stroke) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }

  const bboxArea = (maxX - minX) * (maxY - minY);
  const targetArea = CANVAS_SIZE * 0.5 * (CANVAS_SIZE * 0.5);
  const coverageRatio = Math.min(1, bboxArea / targetArea);
  const lengthRatio = Math.min(1, totalLength / (CANVAS_SIZE * 1.2));

  // Stroke count only ever nudges the result, and only when the glyph
  // says how many strokes it normally takes. Drawing a 3-stroke "A" as
  // one scribble still passes on shape; it just scores a little lower
  // than three placed strokes.
  const strokeFit = expectedStrokes
    ? 1 - Math.min(1, Math.abs(drawn.length - expectedStrokes) / Math.max(expectedStrokes, 2))
    : 1;

  return coverageRatio * 0.45 + lengthRatio * 0.4 + strokeFit * 0.15;
}

const GUIDE_OPACITY: Record<TraceGuideMode, number> = {
  ghost: 0.12,
  dotted: 0.3,
  outline: 0.45,
};

function toPathD(stroke: Stroke): string {
  if (stroke.length === 0) return '';
  if (stroke.length === 1) {
    // A single tap still deserves a visible dot rather than an empty path.
    const p = stroke[0];
    return `M ${p.x} ${p.y} L ${p.x + 0.1} ${p.y}`;
  }
  return `M ${stroke[0].x} ${stroke[0].y} ` + stroke.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
}

interface TraceCanvasProps {
  payload: TracePayload;
  onGlyphAttempt: (passed: boolean) => void;
  onAllGlyphsComplete: () => void;
  /** See QuestionCard's prop of the same name — fires right as the kid moves to a new letter. */
  onReadyForNextItem?: () => void;
  /**
   * Adaptive easing hooks, driven by Magic Canvas Tracing when a kid is
   * struggling: force a heavier guide, fatten the ink, and surface the
   * stroke-order hint. Left alone, the canvas uses whatever the content
   * authored.
   */
  guideModeOverride?: TraceGuideMode;
  showStrokeHint?: boolean;
  inkWidth?: number;
  /** Rendered between the canvas and the buttons — Magic Canvas puts its reward animation here. */
  belowCanvas?: React.ReactNode;
  /** Replaces the default "Great tracing!" banner when the host game shows its own celebration. */
  suppressFeedback?: boolean;
}

/**
 * Free-form tracing surface. Every pen-down starts a **new** stroke and
 * every stroke is kept, so a letter can be drawn the way it's actually
 * taught — "A" as two slants and a crossbar, "t" as a line then a cross —
 * instead of forcing one unbroken line. Undo removes the last stroke
 * only, which is what a kid reaches for after a bad crossbar.
 */
export function TraceCanvas({
  payload,
  onGlyphAttempt,
  onAllGlyphsComplete,
  onReadyForNextItem,
  guideModeOverride,
  showStrokeHint,
  inkWidth = 8,
  belowCanvas,
  suppressFeedback,
}: TraceCanvasProps) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  /**
   * Finished strokes plus the one currently under the finger, held in a
   * single state object. Keeping them together is what lets `commitStroke`
   * be a lone functional update — and therefore safely idempotent, which
   * matters because both `onEnd` and `onFinalize` call it.
   */
  const [ink, setInk] = useState<{ committed: Stroke[]; active: Stroke | null }>({ committed: [], active: null });
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);

  const glyph = payload.glyphs[index];
  const guideMode = guideModeOverride ?? glyph.guideMode;

  const beginStroke = useCallback((x: number, y: number) => {
    setInk((prev) => ({ committed: prev.committed, active: [{ x, y }] }));
    setChecked(false);
  }, []);

  const extendStroke = useCallback((x: number, y: number) => {
    setInk((prev) => {
      if (!prev.active) return prev;
      const last = prev.active[prev.active.length - 1];
      const dx = x - last.x;
      const dy = y - last.y;
      if (dx * dx + dy * dy < MIN_POINT_DISTANCE * MIN_POINT_DISTANCE) return prev;
      return { committed: prev.committed, active: [...prev.active, { x, y }] };
    });
  }, []);

  const commitStroke = useCallback(() => {
    setInk((prev) => (prev.active ? { committed: [...prev.committed, prev.active], active: null } : prev));
  }, []);

  const resetInk = useCallback(() => setInk({ committed: [], active: null }), []);

  // minDistance(0) so a deliberate dot (the tittle on an "i", a period)
  // registers as its own stroke instead of being swallowed as an
  // unrecognized gesture. maxPointers(1) keeps a resting palm from
  // starting a second stroke mid-letter.
  const pan = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .onStart((e) => {
      runOnJS(beginStroke)(e.x, e.y);
    })
    .onUpdate((e) => {
      runOnJS(extendStroke)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(commitStroke)();
    })
    .onFinalize(() => {
      // Covers cancellation (gesture stolen by a parent scroll view) —
      // without it an interrupted stroke would be silently dropped.
      runOnJS(commitStroke)();
    });

  const strokes = ink.committed;
  const allStrokes = ink.active ? [...ink.committed, ink.active] : ink.committed;
  const hasInk = allStrokes.some((s) => s.length >= 2);

  const handleCheck = () => {
    const score = scoreTrace(allStrokes, glyph.expectedStrokes);
    const didPass = score >= payload.passAccuracy;
    setPassed(didPass);
    setChecked(true);
    onGlyphAttempt(didPass);
  };

  const handleUndo = () => {
    setInk((prev) => ({ committed: prev.committed.slice(0, -1), active: null }));
    setChecked(false);
  };

  const handleClear = () => {
    resetInk();
    setChecked(false);
  };

  const handleNextGlyph = () => {
    onReadyForNextItem?.();
    const nextIndex = index + 1;
    resetInk();
    setChecked(false);
    if (nextIndex >= payload.glyphs.length) {
      onAllGlyphsComplete();
      return;
    }
    setIndex(nextIndex);
  };

  return (
    <View>
      <Text
        style={{
          fontFamily: theme.fontFamily.bodyBold,
          fontSize: theme.fontSize.xs,
          color: theme.colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: theme.space[3],
        }}
      >
        {payload.instructions}
      </Text>

      <GestureDetector gesture={pan}>
        <View
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            alignSelf: 'center',
            borderRadius: theme.radius.lg,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.card,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              position: 'absolute',
              fontFamily: theme.fontFamily.headingExtraBold,
              fontSize: CANVAS_SIZE * 0.65,
              color: theme.colors.foreground,
              opacity: GUIDE_OPACITY[guideMode],
            }}
          >
            {glyph.glyph}
          </Text>
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ position: 'absolute' }}>
            {allStrokes.map((stroke, i) => (
              <Path
                key={i}
                d={toPathD(stroke)}
                stroke={theme.colors.accent}
                strokeWidth={inkWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </Svg>
        </View>
      </GestureDetector>

      <Text
        style={{
          textAlign: 'center',
          marginTop: theme.space[2],
          fontFamily: theme.fontFamily.bodyMedium,
          fontSize: theme.fontSize.sm,
          color: theme.colors.mutedForeground,
        }}
      >
        Letter {index + 1} of {payload.glyphs.length}
        {strokes.length > 0 ? ` — ${strokes.length} stroke${strokes.length === 1 ? '' : 's'}` : ''}
      </Text>

      {showStrokeHint && glyph.expectedStrokes ? (
        <Text
          style={{
            textAlign: 'center',
            marginTop: theme.space[1],
            fontFamily: theme.fontFamily.bodyMedium,
            fontSize: theme.fontSize.sm,
            color: theme.colors.accent,
          }}
        >
          Lift your finger between strokes — &ldquo;{glyph.glyph}&rdquo; usually takes {glyph.expectedStrokes}.
        </Text>
      ) : null}

      {belowCanvas}

      {checked && !suppressFeedback ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space[3],
            marginTop: theme.space[4],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: passed ? theme.colors.quaternary : theme.colors.tertiary,
          }}
        >
          <IconBadge
            size={32}
            backgroundColor={theme.colors.card}
            icon={
              passed ? (
                <Check size={16} color={theme.colors.foreground} strokeWidth={3} />
              ) : (
                <X size={16} color={theme.colors.foreground} strokeWidth={3} />
              )
            }
          />
          <Text style={{ flex: 1, fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            {passed ? 'Great tracing!' : 'Good try — want to trace it once more?'}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], marginTop: theme.space[4] }}>
        <Pressable
          onPress={handleUndo}
          disabled={strokes.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Undo last stroke"
        >
          <IconBadge
            size={48}
            backgroundColor={theme.colors.card}
            icon={<Undo2 size={18} color={theme.colors.foreground} strokeWidth={2.5} />}
            style={{ opacity: strokes.length === 0 ? 0.4 : 1 }}
          />
        </Pressable>
        <Pressable onPress={handleClear} accessibilityRole="button" accessibilityLabel="Clear canvas">
          <IconBadge size={48} backgroundColor={theme.colors.card} icon={<RotateCcw size={18} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        {!checked ? (
          <CandyButton label="Check my tracing" onPress={handleCheck} showArrow={false} disabled={!hasInk} />
        ) : (
          <CandyButton label={index + 1 >= payload.glyphs.length ? 'Finish' : 'Next letter'} onPress={handleNextGlyph} />
        )}
      </View>
    </View>
  );
}
