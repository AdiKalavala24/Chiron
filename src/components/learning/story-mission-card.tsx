import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { CandyButton } from '@/components/ui';
import type { QuestionItem, StoryMissionPayload } from '@/features/curriculum';
import { QuestionCard } from './question-card';

interface StoryMissionCardProps {
  payload: StoryMissionPayload;
  onItemAnswered: (correct: boolean, item: QuestionItem) => void;
  onFinished: () => void;
}

/** Reveals the narrative one beat at a time, then rolls into its embedded checks (if any) as a one-pass checklist. */
export function StoryMissionCard({ payload, onItemAnswered, onFinished }: StoryMissionCardProps) {
  const theme = useTheme();
  const [revealedCount, setRevealedCount] = useState(1);
  const [narrativeDone, setNarrativeDone] = useState(payload.narrative.length <= 1 && payload.embeddedChecks.length === 0);

  const handleContinue = () => {
    const next = revealedCount + 1;
    if (next > payload.narrative.length) return;
    setRevealedCount(next);
    if (next === payload.narrative.length && payload.embeddedChecks.length === 0) {
      setNarrativeDone(true);
    }
  };

  return (
    <View>
      <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.xl, color: theme.colors.foreground, marginBottom: theme.space[4] }}>
        {payload.title}
      </Text>

      <View style={{ gap: theme.space[3] }}>
        {payload.narrative.slice(0, revealedCount).map((beat, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.duration(220)}
            style={{
              padding: theme.space[4],
              borderRadius: theme.radius.md,
              borderWidth: theme.borderWidth.chunky,
              borderColor: theme.colors.foreground,
              backgroundColor: theme.colors.card,
            }}
          >
            <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>{beat}</Text>
          </Animated.View>
        ))}
      </View>

      {revealedCount < payload.narrative.length ? (
        <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
          <CandyButton label="Keep reading" onPress={handleContinue} accentColor={theme.colors.secondary} />
        </View>
      ) : null}

      {revealedCount >= payload.narrative.length && payload.embeddedChecks.length > 0 && !narrativeDone ? (
        <View style={{ marginTop: theme.space[6] }}>
          <QuestionCard
            payload={{ instructions: 'What did you notice?', items: payload.embeddedChecks }}
            onItemAnswered={onItemAnswered}
            mode="once"
            onAllItemsComplete={() => setNarrativeDone(true)}
          />
        </View>
      ) : null}

      {narrativeDone ? (
        <View style={{ marginTop: theme.space[6], alignItems: 'flex-start' }}>
          <CandyButton label="Continue" onPress={onFinished} />
        </View>
      ) : null}
    </View>
  );
}
