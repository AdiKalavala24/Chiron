import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, HardShadow, IconBadge } from '@/components/ui';
import { shuffle } from '@/lib/random';
import type { MatchPair, QuestionItem, QuestionPayload } from '@/features/curriculum';

interface QuestionCardProps {
  payload: QuestionPayload;
  /** Fires every time an item is graded — the node player feeds this into progress + the adaptive controller's behavior signal. */
  onItemAnswered: (correct: boolean, item: QuestionItem) => void;
  /**
   * 'loop' (default): keeps asking forever, reshuffling after each full
   * pass — used for the primary `question` method, where the player
   * shell decides when the rolling-accuracy threshold is met and moves
   * on. 'once': stops after a single pass and calls `onAllItemsComplete`
   * — used for video check-questions and story-mission embedded checks,
   * which are short fixed checklists, not open-ended drills.
   */
  mode?: 'loop' | 'once';
  onAllItemsComplete?: () => void;
  /**
   * Fires the instant the kid taps "Next" — i.e. the exact boundary
   * between having fully seen this item's feedback and a new item
   * appearing. This is the only safe moment for the node player to swap
   * in a queued adaptive method change; it must never happen while an
   * item is still on screen.
   */
  onReadyForNextItem?: () => void;
}

export function QuestionCard({ payload, onItemAnswered, mode = 'loop', onAllItemsComplete, onReadyForNextItem }: QuestionCardProps) {
  const theme = useTheme();
  const [queue, setQueue] = useState(() => shuffle(payload.items));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  const item = queue[index % queue.length];

  const handleGraded = (correct: boolean) => {
    setLastCorrect(correct);
    setRevealed(true);
    onItemAnswered(correct, item);
  };

  const handleNext = () => {
    onReadyForNextItem?.();
    const nextIndex = index + 1;
    if (mode === 'once' && nextIndex >= queue.length) {
      onAllItemsComplete?.();
      return;
    }
    setRevealed(false);
    if (nextIndex % queue.length === 0) setQueue(shuffle(payload.items));
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

      <Animated.View key={item.id} entering={FadeIn.duration(180)}>
        <Text
          style={{
            fontFamily: theme.fontFamily.headingBold,
            fontSize: theme.fontSize.xl,
            color: theme.colors.foreground,
            marginBottom: theme.space[5],
          }}
        >
          {item.prompt}
        </Text>

        {(item.kind === 'multiple_choice' || item.kind === 'tap_answer') && item.choices ? (
          <ChoiceList item={item} revealed={revealed} onGraded={handleGraded} />
        ) : null}
        {item.kind === 'fill_blank' ? <FillBlank item={item} revealed={revealed} onGraded={handleGraded} /> : null}
        {item.kind === 'drag_match' && item.matchPairs ? <DragMatch pairs={item.matchPairs} revealed={revealed} onGraded={handleGraded} /> : null}

        {revealed ? (
          <Animated.View entering={FadeIn.duration(160)} style={{ marginTop: theme.space[5] }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: theme.space[3],
                padding: theme.space[4],
                borderRadius: theme.radius.md,
                borderWidth: theme.borderWidth.chunky,
                borderColor: theme.colors.foreground,
                backgroundColor: lastCorrect ? theme.colors.quaternary : theme.colors.tertiary,
              }}
            >
              <IconBadge
                size={32}
                backgroundColor={theme.colors.card}
                icon={lastCorrect ? <Check size={16} color={theme.colors.foreground} strokeWidth={3} /> : <X size={16} color={theme.colors.foreground} strokeWidth={3} />}
              />
              <Text style={{ flex: 1, fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
                {item.coachingTip}
              </Text>
            </View>
            <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
              <CandyButton label={mode === 'once' && index === queue.length - 1 ? 'Finish' : 'Next'} onPress={handleNext} accentColor={theme.colors.accent} />
            </View>
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}

function ChoiceList({
  item,
  revealed,
  onGraded,
}: {
  item: QuestionItem;
  revealed: boolean;
  onGraded: (correct: boolean) => void;
}) {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handlePress = (choiceId: string) => {
    if (revealed) return;
    setSelectedId(choiceId);
    onGraded(choiceId === item.correctChoiceId);
  };

  return (
    <View style={{ gap: theme.space[3] }}>
      {item.choices?.map((choice) => {
        const isCorrectChoice = choice.id === item.correctChoiceId;
        const isSelected = choice.id === selectedId;
        let borderColor: string = theme.colors.foreground;
        let backgroundColor: string = theme.colors.card;
        if (revealed && isCorrectChoice) backgroundColor = theme.colors.quaternary;
        else if (revealed && isSelected && !isCorrectChoice) backgroundColor = '#FDD9DF';
        if (isSelected && !revealed) borderColor = theme.colors.accent;

        return (
          <HardShadow key={choice.id} offset={isSelected ? theme.hardShadow.pressed : theme.hardShadow.rest} radius={theme.radius.md}>
            <Pressable
              onPress={() => handlePress(choice.id)}
              disabled={revealed}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: revealed }}
              style={{
                minHeight: theme.minTapTarget,
                paddingHorizontal: theme.space[4],
                justifyContent: 'center',
                borderRadius: theme.radius.md,
                borderWidth: theme.borderWidth.chunky,
                borderColor,
                backgroundColor,
              }}
            >
              <Text style={{ fontFamily: theme.fontFamily.bodySemiBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>{choice.label}</Text>
            </Pressable>
          </HardShadow>
        );
      })}
    </View>
  );
}

function FillBlank({ item, revealed, onGraded }: { item: QuestionItem; revealed: boolean; onGraded: (correct: boolean) => void }) {
  const theme = useTheme();
  const [value, setValue] = useState('');

  const handleCheck = () => {
    if (revealed || !item.blankAnswer) return;
    const correct = value.trim().toLowerCase() === item.blankAnswer.trim().toLowerCase();
    onGraded(correct);
  };

  return (
    <View style={{ gap: theme.space[3] }}>
      <View style={{ flexDirection: 'row', gap: theme.space[3], alignItems: 'center' }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          editable={!revealed}
          placeholder="Type your answer"
          placeholderTextColor={theme.colors.mutedForeground}
          style={{
            flex: 1,
            minHeight: theme.minTapTarget,
            paddingHorizontal: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.input,
            fontFamily: theme.fontFamily.bodyMedium,
            fontSize: theme.fontSize.base,
            color: theme.colors.foreground,
          }}
        />
        {!revealed ? <CandyButton label="Check" onPress={handleCheck} showArrow={false} /> : null}
      </View>
      {revealed ? (
        <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>
          Correct answer: <Text style={{ fontFamily: theme.fontFamily.bodyBold, color: theme.colors.foreground }}>{item.blankAnswer}</Text>
        </Text>
      ) : null}
    </View>
  );
}

function DragMatch({ pairs, revealed, onGraded }: { pairs: MatchPair[]; revealed: boolean; onGraded: (correct: boolean) => void }) {
  const theme = useTheme();
  const leftItems = useMemo(() => shuffle(pairs.map((p) => p.left)), [pairs]);
  const rightItems = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const correctRightFor = (left: string) => pairs.find((p) => p.left === left)?.right;

  const handleLeftPress = (left: string) => {
    if (revealed || matched[left]) return;
    setSelectedLeft(left);
  };

  const handleRightPress = (right: string) => {
    if (revealed || !selectedLeft) return;
    const isAlreadyMatched = Object.values(matched).includes(right);
    if (isAlreadyMatched) return;

    if (correctRightFor(selectedLeft) === right) {
      const nextMatched = { ...matched, [selectedLeft]: right };
      setMatched(nextMatched);
      setSelectedLeft(null);
      if (Object.keys(nextMatched).length === pairs.length) {
        onGraded(wrongAttempts === 0);
      }
    } else {
      setWrongAttempts((n) => n + 1);
      setSelectedLeft(null);
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: theme.space[4] }}>
      <View style={{ flex: 1, gap: theme.space[2] }}>
        {leftItems.map((left) => (
          <MatchChip key={left} label={left} selected={selectedLeft === left} done={!!matched[left]} onPress={() => handleLeftPress(left)} />
        ))}
      </View>
      <View style={{ flex: 1, gap: theme.space[2] }}>
        {rightItems.map((right) => (
          <MatchChip key={right} label={right} selected={false} done={Object.values(matched).includes(right)} onPress={() => handleRightPress(right)} />
        ))}
      </View>
    </View>
  );
}

function MatchChip({ label, selected, done, onPress }: { label: string; selected: boolean; done: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={done}
      style={{
        minHeight: theme.minTapTarget * 0.8,
        justifyContent: 'center',
        paddingHorizontal: theme.space[3],
        borderRadius: theme.radius.sm,
        borderWidth: theme.borderWidth.chunky,
        borderColor: theme.colors.foreground,
        backgroundColor: done ? theme.colors.quaternary : selected ? theme.colors.accent : theme.colors.card,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.bodySemiBold,
          fontSize: theme.fontSize.sm,
          color: selected ? theme.colors.accentForeground : theme.colors.foreground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
