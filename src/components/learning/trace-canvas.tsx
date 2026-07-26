import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { runOnJS } from 'react-native-reanimated';
import { Check, RotateCcw, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import type { TracePayload } from '@/features/curriculum';

const CANVAS_SIZE = 260;

interface Point {
  x: number;
  y: number;
}

/**
 * Scores a coverage/length heuristic against the drawn stroke — how much
 * of the guide area was used, and whether enough total stroke length
 * was drawn. This is NOT real handwriting-shape recognition (that needs
 * a trained model, well outside what this pass can ship); it's a coarse
 * but honestly-computed proxy so tracing has real, responsive feedback
 * instead of an always-pass rubber stamp.
 */
function scoreTrace(points: Point[]): number {
  if (points.length < 2) return 0;
  let length = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    if (i > 0) {
      const dx = p.x - points[i - 1].x;
      const dy = p.y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
  }

  const bboxArea = (maxX - minX) * (maxY - minY);
  const targetArea = (CANVAS_SIZE * 0.5) * (CANVAS_SIZE * 0.5);
  const coverageRatio = Math.min(1, bboxArea / targetArea);
  const lengthRatio = Math.min(1, length / (CANVAS_SIZE * 1.2));
  return coverageRatio * 0.5 + lengthRatio * 0.5;
}

const GUIDE_OPACITY: Record<TracePayload['glyphs'][number]['guideMode'], number> = {
  ghost: 0.12,
  dotted: 0.3,
  outline: 0.45,
};

interface TraceCanvasProps {
  payload: TracePayload;
  onGlyphAttempt: (passed: boolean) => void;
  onAllGlyphsComplete: () => void;
  /** See QuestionCard's prop of the same name — fires right as the kid moves to a new letter. */
  onReadyForNextItem?: () => void;
}

export function TraceCanvas({ payload, onGlyphAttempt, onAllGlyphsComplete, onReadyForNextItem }: TraceCanvasProps) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState<Point[]>([]);
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);

  const glyph = payload.glyphs[index];

  const startStroke = useCallback((x: number, y: number) => setPoints([{ x, y }]), []);
  const addStrokePoint = useCallback((x: number, y: number) => setPoints((prev) => [...prev, { x, y }]), []);

  const pan = Gesture.Pan()
    .onStart((e) => {
      runOnJS(startStroke)(e.x, e.y);
    })
    .onUpdate((e) => {
      runOnJS(addStrokePoint)(e.x, e.y);
    });

  const pathD =
    points.length > 1 ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') : '';

  const handleCheck = () => {
    const score = scoreTrace(points);
    const didPass = score >= payload.passAccuracy;
    setPassed(didPass);
    setChecked(true);
    onGlyphAttempt(didPass);
  };

  const handleClear = () => {
    setPoints([]);
    setChecked(false);
  };

  const handleNextGlyph = () => {
    onReadyForNextItem?.();
    const nextIndex = index + 1;
    setPoints([]);
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
              opacity: GUIDE_OPACITY[glyph.guideMode],
            }}
          >
            {glyph.glyph}
          </Text>
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ position: 'absolute' }}>
            {pathD ? <Path d={pathD} stroke={theme.colors.accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
          </Svg>
        </View>
      </GestureDetector>

      <Text style={{ textAlign: 'center', marginTop: theme.space[2], fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
        Letter {index + 1} of {payload.glyphs.length}
      </Text>

      {checked ? (
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
            icon={passed ? <Check size={16} color={theme.colors.foreground} strokeWidth={3} /> : <X size={16} color={theme.colors.foreground} strokeWidth={3} />}
          />
          <Text style={{ flex: 1, fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            {passed ? 'Great tracing!' : 'Good try — want to trace it once more?'}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], marginTop: theme.space[4] }}>
        <Pressable onPress={handleClear} accessibilityRole="button" accessibilityLabel="Clear canvas">
          <IconBadge size={48} backgroundColor={theme.colors.card} icon={<RotateCcw size={18} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        {!checked ? (
          <CandyButton label="Check my tracing" onPress={handleCheck} showArrow={false} disabled={points.length < 2} />
        ) : (
          <CandyButton label={index + 1 >= payload.glyphs.length ? 'Finish' : 'Next letter'} onPress={handleNextGlyph} />
        )}
      </View>
    </View>
  );
}
