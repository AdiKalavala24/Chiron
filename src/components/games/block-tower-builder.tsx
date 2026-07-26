import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Undo2 } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import { shuffle } from '@/lib/random';
import type { GamePayload, QuestionItem } from '@/features/curriculum';
import { GameShell } from './game-shell';
import { BlockTowerScene, type BlockSpec, type GameReactionState } from './scenes';

const FEEDBACK_MS = 1800;

/** The two block colors a round can call for, kept visually distinct from the success/error flashes. */
const PART_COLORS = ['#38BDF8', '#FBBF24'] as const;

interface TowerRound {
  /** How many blocks of each color the kid needs, in order. */
  parts: number[];
  total: number;
  /** The sentence shown above the tower. */
  goalText: string;
  /** The arithmetic being made concrete, e.g. "4 + 3 = 7". Empty for pure counting rounds. */
  equation: string;
  coachingTip: string;
}

/**
 * Turns a node's own math items into buildable tower rounds so the game
 * drills the same skill the node teaches, rather than inventing unrelated
 * arithmetic.
 *
 * Three shapes are recognized, most specific first:
 *  - "4 + 3 = ?"  -> a two-color round, the addends made physical
 *  - "5 − 2 = ?"  -> the difference, built as one color (take-away is
 *                    modeled as "build what's left")
 *  - anything whose correct answer is a number -> a counting round
 * Items that yield no number at all are skipped; if that leaves nothing,
 * `fallbackRounds` supplies difficulty-scaled counting rounds.
 */
export function buildRounds(items: readonly QuestionItem[], difficulty: number): TowerRound[] {
  const rounds: TowerRound[] = [];

  for (const item of items) {
    const answer = numericAnswer(item);
    const addition = item.prompt.match(/(\d+)\s*\+\s*(\d+)/);

    if (addition) {
      const a = Number(addition[1]);
      const b = Number(addition[2]);
      if (a > 0 && b > 0 && a + b <= 12) {
        rounds.push({
          parts: [a, b],
          total: a + b,
          goalText: `Stack ${a} blue blocks and ${b} yellow blocks to reach the star on platform ${a + b}.`,
          equation: `${a} + ${b} = ${a + b}`,
          coachingTip: item.coachingTip,
        });
        continue;
      }
    }

    if (answer !== null && answer > 0 && answer <= 12) {
      const subtraction = item.prompt.match(/(\d+)\s*[-−–]\s*(\d+)/);
      rounds.push({
        parts: [answer],
        total: answer,
        goalText: subtraction
          ? `${subtraction[1]} blocks, take away ${subtraction[2]} — build the tower that is left.`
          : `Build a tower exactly ${answer} blocks tall to reach the star.`,
        equation: subtraction ? `${subtraction[1]} − ${subtraction[2]} = ${answer}` : '',
        coachingTip: item.coachingTip,
      });
    }
  }

  return rounds.length > 0 ? rounds : fallbackRounds(difficulty);
}

function numericAnswer(item: QuestionItem): number | null {
  const label =
    item.kind === 'fill_blank'
      ? item.blankAnswer
      : item.choices?.find((c) => c.id === item.correctChoiceId)?.label;
  if (!label) return null;
  const match = label.match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function fallbackRounds(difficulty: number): TowerRound[] {
  const ceiling = Math.min(10, 3 + difficulty * 2);
  return [2, 3, 4].map((offset) => {
    const a = Math.max(1, Math.min(ceiling - 1, offset));
    const b = Math.max(1, Math.min(ceiling - a, difficulty));
    return {
      parts: [a, b],
      total: a + b,
      goalText: `Stack ${a} blue blocks and ${b} yellow blocks to reach the star on platform ${a + b}.`,
      equation: `${a} + ${b} = ${a + b}`,
      coachingTip: `Count the blue blocks first, then keep counting as you add the yellow ones.`,
    };
  });
}

interface BlockTowerBuilderProps {
  payload: GamePayload;
  onItemAnswered: (correct: boolean) => void;
  onReadyForNextItem?: () => void;
}

/**
 * Math's flagship game. The kid drags 3D blocks onto a stack to make a
 * number combination physical — "4 blue and 3 yellow" is literally
 * countable off the tower.
 *
 * The adaptive beat drops the symbolic equation in favour of concrete
 * representations: after one miss the parts are drawn as dot groups,
 * after two a number line appears with the target marked.
 */
export function BlockTowerBuilder({ payload, onItemAnswered, onReadyForNextItem }: BlockTowerBuilderProps) {
  const theme = useTheme();
  const rounds = useMemo(() => shuffle(buildRounds(payload.items, payload.difficulty)), [payload.items, payload.difficulty]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [placed, setPlaced] = useState<BlockSpec[]>([]);
  const [misses, setMisses] = useState(0);
  const [reaction, setReaction] = useState<GameReactionState>('idle');
  const [feedback, setFeedback] = useState<{ correct: boolean; tip: string } | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = rounds[roundIndex % rounds.length];

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  const addBlock = useCallback((color: string) => {
    setPlaced((prev) => (prev.length >= 14 ? prev : [...prev, { color }]));
  }, []);

  const handleUndo = () => setPlaced((prev) => prev.slice(0, -1));

  const handleCheck = () => {
    if (feedback) return;
    // Correct means both the right total *and* the right count of each
    // color — otherwise "7 yellow" would pass a "4 blue + 3 yellow" round
    // and the number combination wouldn't have been modeled at all.
    const correct =
      placed.length === round.total &&
      round.parts.every((count, i) => placed.filter((b) => b.color === PART_COLORS[i]).length === count);

    setReaction(correct ? 'correct' : 'incorrect');
    setFeedback({ correct, tip: correct ? round.coachingTip : `${round.goalText} You have ${placed.length} so far.` });
    setMisses((n) => (correct ? 0 : n + 1));
    onItemAnswered(correct);

    advanceTimer.current = setTimeout(() => {
      onReadyForNextItem?.();
      setFeedback(null);
      setReaction('idle');
      setPlaced([]);
      if (correct) {
        setMisses(0);
        setRoundIndex((i) => i + 1);
      }
    }, FEEDBACK_MS);
  };

  const activeColors = PART_COLORS.slice(0, round.parts.length);

  return (
    <GameShell
      skillChip={payload.skillChip}
      roundGoal={round.goalText}
      colorHex="#FBBF24"
      reactionState={reaction}
      progressRatio={Math.min(1, placed.length / Math.max(round.total, 1))}
      canvasHeight={240}
      scene={
        <BlockTowerScene
          colorHex="#FBBF24"
          reactionState={reaction}
          progressRatio={Math.min(1, placed.length / Math.max(round.total, 1))}
          blocks={placed}
          goalHeight={round.total}
        />
      }
    >
      <RoundPrompt round={round} misses={misses} />

      <Text
        style={{
          marginTop: theme.space[4],
          fontFamily: theme.fontFamily.bodyBold,
          fontSize: theme.fontSize.xs,
          color: theme.colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        Drag a block up to the tower — or tap it
      </Text>

      <View style={{ flexDirection: 'row', gap: theme.space[3], marginTop: theme.space[3], alignItems: 'center' }}>
        {activeColors.map((color, i) => (
          <DraggableBlock
            key={color}
            color={color}
            label={`${placed.filter((b) => b.color === color).length}`}
            accessibilityLabel={`Add a ${i === 0 ? 'blue' : 'yellow'} block`}
            onDrop={() => addBlock(color)}
          />
        ))}
        <Pressable onPress={handleUndo} disabled={placed.length === 0} accessibilityRole="button" accessibilityLabel="Remove last block">
          <IconBadge
            size={48}
            backgroundColor={theme.colors.card}
            icon={<Undo2 size={18} color={theme.colors.foreground} strokeWidth={2.5} />}
            style={{ opacity: placed.length === 0 ? 0.4 : 1 }}
          />
        </Pressable>
      </View>

      {feedback ? (
        <View
          style={{
            marginTop: theme.space[4],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: feedback.correct ? theme.colors.quaternary : theme.colors.tertiary,
          }}
        >
          <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            {feedback.correct ? 'You reached the star!' : 'Not quite there yet.'}
          </Text>
          <Text style={{ marginTop: 2, fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>
            {feedback.tip}
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
          <CandyButton label="Check my tower" onPress={handleCheck} showArrow={false} disabled={placed.length === 0} />
        </View>
      )}
    </GameShell>
  );
}

/**
 * The prompt swaps representation as the kid struggles: symbols first,
 * then dot groups, then a number line with the target marked.
 */
function RoundPrompt({ round, misses }: { round: TowerRound; misses: number }) {
  const theme = useTheme();

  if (misses === 0) {
    return round.equation ? (
      <View
        style={{
          padding: theme.space[4],
          borderRadius: theme.radius.md,
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.foreground,
          backgroundColor: theme.colors.card,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: theme.fontFamily.headingExtraBold, fontSize: theme.fontSize.xl, color: theme.colors.foreground }}>
          {round.equation.replace(/=\s*\d+$/, '= ?')}
        </Text>
      </View>
    ) : null;
  }

  return (
    <View
      style={{
        padding: theme.space[4],
        borderRadius: theme.radius.md,
        borderWidth: theme.borderWidth.chunky,
        borderColor: theme.colors.foreground,
        backgroundColor: theme.colors.card,
      }}
    >
      <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.xs, color: theme.colors.accent, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {misses >= 2 ? 'Count along the number line' : 'Here it is as dots'}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], marginTop: theme.space[3], flexWrap: 'wrap' }}>
        {round.parts.map((count, partIndex) => (
          <React.Fragment key={partIndex}>
            {partIndex > 0 ? (
              <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>+</Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', maxWidth: 120 }}>
              {Array.from({ length: count }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: theme.borderWidth.chunky,
                    borderColor: theme.colors.foreground,
                    backgroundColor: PART_COLORS[partIndex],
                  }}
                />
              ))}
            </View>
          </React.Fragment>
        ))}
      </View>

      {misses >= 2 ? (
        <View style={{ flexDirection: 'row', marginTop: theme.space[4], flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: Math.max(round.total + 2, 6) }).map((_, i) => {
            const value = i + 1;
            const isTarget = value === round.total;
            return (
              <View
                key={value}
                style={{
                  minWidth: 26,
                  paddingVertical: 2,
                  alignItems: 'center',
                  borderRadius: theme.radius.sm,
                  borderWidth: theme.borderWidth.chunky,
                  borderColor: isTarget ? theme.colors.foreground : theme.colors.border,
                  backgroundColor: isTarget ? theme.colors.tertiary : theme.colors.card,
                }}
              >
                <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>{value}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const DRAG_DROP_THRESHOLD = -40;

/**
 * A block the kid physically drags upward onto the tower. Released above
 * the threshold it snaps into the stack; released short of it, it springs
 * back. Tapping does the same thing, so the interaction never becomes a
 * dexterity barrier.
 */
function DraggableBlock({
  color,
  label,
  accessibilityLabel,
  onDrop,
}: {
  color: string;
  label: string;
  accessibilityLabel: string;
  onDrop: () => void;
}) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lifted = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      lifted.value = withSpring(1);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY < DRAG_DROP_THRESHOLD) runOnJS(onDrop)();
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      lifted.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: 1 + lifted.value * 0.12 }],
    zIndex: lifted.value > 0 ? 10 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <Pressable onPress={onDrop} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
          <View
            style={{
              width: 64,
              height: 48,
              borderRadius: theme.radius.sm,
              borderWidth: theme.borderWidth.thick,
              borderColor: theme.colors.foreground,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: theme.fontFamily.headingExtraBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>{label}</Text>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
