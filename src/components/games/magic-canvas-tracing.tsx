import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { IconBadge } from '@/components/ui';
import { TraceCanvas } from '@/components/learning/trace-canvas';
import type { GamePayload, TraceGlyph, TraceGuideMode } from '@/features/curriculum';
import { GameShell } from './game-shell';
import { RewardScene, rewardForGlyph, type GameReactionState } from './scenes';

const PASS_ACCURACY = 0.62;
/** How long the earned object stays on screen before the next letter loads. */
const REWARD_MS = 2600;

interface TraceAssist {
  level: 0 | 1 | 2;
  guideMode?: TraceGuideMode;
  inkWidth: number;
  showStrokeHint: boolean;
}

/**
 * Precision help escalates per letter, not per session — a kid who nails
 * "B" and then struggles with "R" gets help on "R" from a clean slate.
 */
function traceAssistFor(missesOnGlyph: number): TraceAssist {
  if (missesOnGlyph >= 2) return { level: 2, guideMode: 'outline', inkWidth: 14, showStrokeHint: true };
  if (missesOnGlyph >= 1) return { level: 1, guideMode: 'dotted', inkWidth: 11, showStrokeHint: true };
  return { level: 0, inkWidth: 8, showStrokeHint: false };
}

interface MagicCanvasTracingProps {
  payload: GamePayload;
  onItemAnswered: (correct: boolean) => void;
  onReadyForNextItem?: () => void;
}

/**
 * Writing's flagship game. The kid traces a guide letter with a finger;
 * a completed letter pops off the canvas and animates into a 3D object
 * that starts with that letter ("B" becomes a butterfly).
 *
 * Glyph sequencing lives here rather than inside TraceCanvas — the canvas
 * is handed exactly one glyph at a time and remounted per letter — because
 * the reward object has to know which letter was just earned.
 */
export function MagicCanvasTracing({ payload, onItemAnswered, onReadyForNextItem }: MagicCanvasTracingProps) {
  const theme = useTheme();
  const glyphs = useMemo(() => payload.traceGlyphs ?? [], [payload.traceGlyphs]);
  const [glyphIndex, setGlyphIndex] = useState(0);
  const [missesOnGlyph, setMissesOnGlyph] = useState(0);
  const [reaction, setReaction] = useState<GameReactionState>('idle');
  const [earned, setEarned] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const rewardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const glyph: TraceGlyph | undefined = glyphs[glyphIndex % Math.max(glyphs.length, 1)];
  const reward = rewardForGlyph(glyph?.glyph ?? '');
  const assist = traceAssistFor(missesOnGlyph);

  useEffect(
    () => () => {
      if (rewardTimer.current) clearTimeout(rewardTimer.current);
      Speech.stop();
    },
    [],
  );

  if (!glyph) {
    return (
      <Text style={{ fontFamily: theme.fontFamily.body, color: theme.colors.mutedForeground }}>
        This game has no letters to trace yet.
      </Text>
    );
  }

  const handleAttempt = (passed: boolean) => {
    onItemAnswered(passed);
    setReaction(passed ? 'correct' : 'incorrect');

    if (!passed) {
      setMissesOnGlyph((n) => n + 1);
      return;
    }

    setEarned((n) => n + 1);
    setRevealed(true);
    Speech.stop();
    Speech.speak(`${glyph.glyph} is for ${reward.word}!`, { rate: 0.9, pitch: 1.25 });

    rewardTimer.current = setTimeout(() => {
      onReadyForNextItem?.();
      setRevealed(false);
      setReaction('idle');
      setMissesOnGlyph(0);
      setGlyphIndex((i) => i + 1);
    }, REWARD_MS);
  };

  return (
    <GameShell
      skillChip={payload.skillChip}
      roundGoal={payload.roundGoal}
      colorHex={reward.color}
      reactionState={reaction}
      progressRatio={Math.min(1, earned / Math.max(glyphs.length, 1))}
      canvasHeight={190}
      scene={<RewardScene shape={reward.shape} colorHex={reward.color} revealed={revealed} />}
    >
      {revealed ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space[3],
            marginBottom: theme.space[4],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.quaternary,
          }}
        >
          <IconBadge size={36} backgroundColor={theme.colors.card} icon={<Sparkles size={18} color={theme.colors.foreground} strokeWidth={2.5} />} />
          <Text style={{ flex: 1, fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            {glyph.glyph} is for {reward.word}!
          </Text>
        </View>
      ) : null}

      <TraceCanvas
        // Remounting per letter is what gives each glyph a clean canvas and
        // resets the guide back to whatever the content authored.
        key={`${glyph.id}-${glyphIndex}-${assist.level}`}
        payload={{
          instructions: assist.level > 0 ? 'Take your time — lift your finger between strokes.' : payload.roundGoal,
          glyphs: [glyph],
          passAccuracy: PASS_ACCURACY,
        }}
        onGlyphAttempt={handleAttempt}
        onAllGlyphsComplete={() => {
          /* Sequencing is owned here; the canvas only ever holds one glyph. */
        }}
        guideModeOverride={assist.guideMode}
        showStrokeHint={assist.showStrokeHint}
        inkWidth={assist.inkWidth}
        suppressFeedback={revealed}
      />

      {assist.level > 0 && !revealed ? (
        <Text
          style={{
            marginTop: theme.space[3],
            fontFamily: theme.fontFamily.bodyMedium,
            fontSize: theme.fontSize.sm,
            color: theme.colors.accent,
            textAlign: 'center',
          }}
        >
          {assist.level === 2
            ? 'The guide got bolder and your ink got thicker — just follow the shape.'
            : 'Here is a stronger guide line to follow.'}
        </Text>
      ) : null}
    </GameShell>
  );
}
