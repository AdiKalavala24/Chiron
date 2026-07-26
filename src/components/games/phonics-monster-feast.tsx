import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { useTheme } from '@/theme';
import { shuffle } from '@/lib/random';
import type { GamePayload, QuestionChoice } from '@/features/curriculum';
import { GameShell } from './game-shell';
import { MonsterScene, type GameReactionState } from './scenes';

const LANES = 3;
const BUBBLE_HEIGHT = 46;
const BASE_TRAVERSAL_MS = 7000;
/** How long the coaching tip stays up before the next round starts. */
const FEEDBACK_MS = 1500;

/** Escalating help after repeated misses on the same request. See `assistFor`. */
interface AssistProfile {
  level: 0 | 1 | 2;
  /** Multiplier on how long a bubble takes to cross — higher is slower, so easier to catch. */
  slowFactor: number;
  /** Drop this many wrong choices from the field. */
  removeDistractors: number;
  speakClue: boolean;
}

function assistFor(consecutiveMisses: number): AssistProfile {
  if (consecutiveMisses >= 3) return { level: 2, slowFactor: 2.4, removeDistractors: 2, speakClue: true };
  if (consecutiveMisses >= 1) return { level: 1, slowFactor: 1.6, removeDistractors: 0, speakClue: true };
  return { level: 0, slowFactor: 1, removeDistractors: 0, speakClue: false };
}

interface PhonicsMonsterFeastProps {
  payload: GamePayload;
  onItemAnswered: (correct: boolean) => void;
  onReadyForNextItem?: () => void;
}

/**
 * Reading's flagship game. A hungry monster asks for a specific sound or
 * word; the answer choices drift across the screen as bubbles and the kid
 * taps the right one to feed it.
 *
 * Rounds come straight from the node's own question items — the monster's
 * request is the item prompt and the bubbles are its choices — so the
 * game is always drilling the skill the node is about, and grading flows
 * through `onItemAnswered` exactly like every other method.
 *
 * The adaptive beat is local and immediate (distinct from the
 * camera-driven method switch): consecutive misses slow the bubbles down,
 * have the monster say a clue out loud, and eventually thin out the
 * distractors.
 */
export function PhonicsMonsterFeast({ payload, onItemAnswered, onReadyForNextItem }: PhonicsMonsterFeastProps) {
  const theme = useTheme();
  // Only choice-bearing items can become bubbles. Fill-in-the-blank and
  // drag-match items are valid content elsewhere (and Gemini may generate
  // them), but they'd render an empty field here.
  const feedable = useMemo(() => payload.items.filter((i) => i.choices?.length && i.correctChoiceId), [payload.items]);
  const [queue, setQueue] = useState(() => shuffle(feedable));
  const [index, setIndex] = useState(0);
  const [reaction, setReaction] = useState<GameReactionState>('idle');
  const [feedback, setFeedback] = useState<{ correct: boolean; tip: string } | null>(null);
  const [fed, setFed] = useState(0);
  const [misses, setMisses] = useState(0);
  const [field, setField] = useState({ width: 0, height: LANES * (BUBBLE_HEIGHT + 12) });
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = queue.length > 0 ? queue[index % queue.length] : undefined;
  const assist = assistFor(misses);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      Speech.stop();
    },
    [],
  );

  /** Choices actually on the field, with distractors thinned out at high assist. */
  const bubbles = useMemo(() => {
    const choices = item?.choices ?? [];
    const correct = choices.filter((c) => c.id === item?.correctChoiceId);
    const wrong = shuffle(choices.filter((c) => c.id !== item?.correctChoiceId));
    const kept = assist.removeDistractors > 0 ? wrong.slice(0, Math.max(1, wrong.length - assist.removeDistractors)) : wrong;
    return shuffle([...correct, ...kept]);
    // `index` is in the dep list because a new round must rebuild the
    // field even when the item object itself is reference-equal (the queue
    // reshuffles through the same items repeatedly).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, index, assist.removeDistractors]);

  // The monster asks out loud once help is warranted — a silly spoken clue
  // is the intended nudge for a kid who's stuck, not a text wall.
  useEffect(() => {
    if (!assist.speakClue || feedback || !item) return;
    Speech.stop();
    Speech.speak(`Yum! ${item.prompt}`, { rate: 0.88, pitch: 1.45 });
    return () => {
      Speech.stop();
    };
  }, [assist.speakClue, item, feedback]);

  const handleTap = (choice: QuestionChoice) => {
    if (feedback || !item) return;
    const correct = choice.id === item.correctChoiceId;
    setReaction(correct ? 'correct' : 'incorrect');
    setFeedback({ correct, tip: item.coachingTip });
    setMisses((n) => (correct ? 0 : n + 1));
    if (correct) setFed((n) => n + 1);
    onItemAnswered(correct);

    Speech.stop();
    Speech.speak(correct ? 'Yum yum yum!' : 'Blegh! Not that one.', { rate: 0.95, pitch: correct ? 1.5 : 0.8 });

    advanceTimer.current = setTimeout(() => {
      onReadyForNextItem?.();
      setReaction('idle');
      setFeedback(null);
      const nextIndex = index + 1;
      if (nextIndex % queue.length === 0) setQueue(shuffle(feedable));
      setIndex(nextIndex);
    }, FEEDBACK_MS);
  };

  const handleFieldLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setField((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  if (!item) {
    return (
      <Text style={{ fontFamily: theme.fontFamily.body, color: theme.colors.mutedForeground }}>
        The monster has nothing to munch on yet.
      </Text>
    );
  }

  return (
    <GameShell
      skillChip={payload.skillChip}
      roundGoal={payload.roundGoal}
      colorHex="#8B5CF6"
      reactionState={reaction}
      progressRatio={Math.min(1, fed / 5)}
      canvasHeight={200}
      scene={<MonsterScene colorHex="#8B5CF6" reactionState={reaction} progressRatio={Math.min(1, fed / 5)} />}
    >
      <View
        style={{
          padding: theme.space[4],
          borderRadius: theme.radius.md,
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.foreground,
          backgroundColor: theme.colors.card,
        }}
      >
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>
          {item.prompt}
        </Text>
        {assist.level > 0 ? (
          <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.accent }}>
            {assist.level === 2 ? 'The monster slowed the bubbles way down and shooed some away.' : 'The monster slowed the bubbles down for you.'}
          </Text>
        ) : null}
      </View>

      <View
        onLayout={handleFieldLayout}
        style={{
          height: field.height,
          marginTop: theme.space[3],
          borderRadius: theme.radius.md,
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.muted,
          overflow: 'hidden',
        }}
      >
        {field.width > 0
          ? bubbles.map((choice, i) => (
              <FloatingBubble
                key={`${item.id}-${choice.id}-${index}`}
                choice={choice}
                lane={i % LANES}
                order={i}
                total={bubbles.length}
                fieldWidth={field.width}
                durationMs={BASE_TRAVERSAL_MS * assist.slowFactor}
                frozen={!!feedback}
                onPress={() => handleTap(choice)}
              />
            ))
          : null}
      </View>

      {feedback ? (
        <View
          style={{
            marginTop: theme.space[3],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: feedback.correct ? theme.colors.quaternary : theme.colors.tertiary,
          }}
        >
          <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            {feedback.correct ? 'Yum! Great feeding.' : 'Blegh — not that one.'}
          </Text>
          <Text style={{ marginTop: 2, fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>
            {feedback.tip}
          </Text>
        </View>
      ) : null}
    </GameShell>
  );
}

function FloatingBubble({
  choice,
  lane,
  order,
  total,
  fieldWidth,
  durationMs,
  frozen,
  onPress,
}: {
  choice: QuestionChoice;
  lane: number;
  order: number;
  total: number;
  fieldWidth: number;
  durationMs: number;
  frozen: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const bubbleWidth = Math.max(76, choice.label.length * 11 + 36);
  const translateX = useSharedValue(fieldWidth);

  useEffect(() => {
    if (frozen) return;
    // Stagger the starts so the field reads as a stream rather than a
    // single wall of bubbles arriving together.
    const stagger = (durationMs / Math.max(total, 1)) * order;
    translateX.value = fieldWidth;
    translateX.value = withDelay(
      stagger * 0.6,
      withRepeat(withTiming(-bubbleWidth, { duration: durationMs, easing: Easing.linear }), -1, false),
    );
  }, [fieldWidth, durationMs, bubbleWidth, order, total, frozen, translateX]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          top: lane * (BUBBLE_HEIGHT + 12) + 6,
          width: bubbleWidth,
          height: BUBBLE_HEIGHT,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={choice.label}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.full,
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.foreground,
          backgroundColor: theme.colors.card,
        }}
      >
        <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }} numberOfLines={1}>
          {choice.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
