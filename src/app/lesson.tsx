import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deriveEngagementState, useEngagement, type InteractionEvent } from '@/adaptive';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { SecondaryButton } from '@/components/ui/button';
import { StickerCard } from '@/components/ui/card';
import { ConfettiField } from '@/components/ui/shapes';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createMockTutorLLMClient, type TutorTurnResponse } from '@/services/llm';

type Difficulty = 'easy' | 'medium' | 'hard';
type Question = {
  id: string;
  label: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  difficulty: Difficulty;
};

const QUESTIONS: Question[] = [
  {
    id: 'smores',
    label: "S'mores count",
    prompt: "You have 3 s'mores and roast 2 more. How many s'mores now?",
    choices: ['4', '5', '6'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'canoe',
    label: 'Canoe trip',
    prompt: '8 campers split evenly into 2 canoes. How many per canoe?',
    choices: ['3', '4', '5'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'campfire',
    label: 'Campfire wood',
    prompt: 'Each log burns for 15 minutes. How many logs for a 45-minute campfire?',
    choices: ['2', '3', '4'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'relay',
    label: 'Lake relay',
    prompt: 'A relay race is 400m, split into 4 equal legs. How long is each leg?',
    choices: ['50m', '100m', '150m'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'trailmix',
    label: 'Trail mix ratio',
    prompt: 'A recipe uses 3 raisins for every 2 nuts. For 9 raisins, how many nuts?',
    choices: ['4', '6', '8'],
    correctIndex: 1,
    difficulty: 'hard',
  },
];

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

function pickNext(difficulty: Difficulty, usedIds: Set<string>): Question {
  const pool = QUESTIONS.filter((q) => q.difficulty === difficulty);
  const unused = pool.filter((q) => !usedIds.has(q.id));
  return unused[0] ?? pool[0] ?? QUESTIONS[0];
}

const tutorClient = createMockTutorLLMClient();

export default function LessonScreen() {
  const theme = useTheme();
  const { state, adjustment, history, recordAttempt } = useEngagement();

  const [difficultyIndex, setDifficultyIndex] = useState(1); // start at "medium"
  const usedIds = useRef(new Set<string>());
  const [question, setQuestion] = useState<Question>(() =>
    pickNext(DIFFICULTY_ORDER[1], usedIds.current),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [tutorTurn, setTutorTurn] = useState<TutorTurnResponse | null>(null);
  const [thinking, setThinking] = useState(false);
  const questionShownAt = useRef(Date.now());

  const showConfetti = state === 'celebrating' || adjustment.motionScale >= 1;

  const onAnswer = async (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    usedIds.current.add(question.id);

    const responseTimeMs = Date.now() - questionShownAt.current;
    const correct = index === question.correctIndex;

    // Compute the post-answer state locally rather than reading it back off
    // context: `recordAttempt` schedules a state update that won't have
    // landed yet by the time we need it a few lines down.
    const newEvent: InteractionEvent = { timestamp: Date.now(), correct, responseTimeMs, questionLabel: question.label };
    const nextHistory = [...history, newEvent];
    const nextState = deriveEngagementState(nextHistory);
    recordAttempt(correct, responseTimeMs, question.label);

    setThinking(true);
    const turn = await tutorClient.generateTurn({
      childName: 'Explorer',
      engagementState: nextState,
      recentHistory: nextHistory,
      lastQuestionLabel: question.label,
    });
    setThinking(false);
    setTutorTurn(turn);

    const delta = turn.nextDifficulty === 'harder' ? 1 : turn.nextDifficulty === 'easier' ? -1 : 0;
    setDifficultyIndex((prev) => Math.min(2, Math.max(0, prev + delta)));
  };

  const onNext = () => {
    const nextDifficulty = DIFFICULTY_ORDER[difficultyIndex];
    setQuestion(pickNext(nextDifficulty, usedIds.current));
    setSelected(null);
    setTutorTurn(null);
    questionShownAt.current = Date.now();
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <ThemedText type="h1">Practice time</ThemedText>
            <Badge label={adjustment.label} color={adjustment.accentColor} />
          </View>

          <View style={styles.tutorWrapper}>
            {showConfetti && <ConfettiField />}
            <StickerCard
              title="Chiron says"
              iconBackground={adjustment.accentColor}
              variant={state === 'celebrating' ? 'featured' : 'default'}
              style={styles.tutorCard}>
              <ThemedText type="body" themeColor="mutedForeground">
                {thinking ? 'Thinking…' : tutorTurn?.message ?? "Let's give this one a try."}
              </ThemedText>
            </StickerCard>
          </View>

          <StickerCard title={question.label} style={styles.questionCard}>
            <ThemedText type="bodyLg">{question.prompt}</ThemedText>
            <View style={styles.choices}>
              {question.choices.map((choice, index) => {
                const isSelected = selected === index;
                const isCorrectChoice = index === question.correctIndex;
                const revealColor =
                  selected === null ? undefined : isCorrectChoice ? theme.quaternary : isSelected ? theme.secondary : undefined;
                return (
                  <SecondaryButton
                    key={choice}
                    label={choice}
                    disabled={selected !== null}
                    onPress={() => onAnswer(index)}
                    style={[styles.choiceButton, revealColor ? { backgroundColor: revealColor } : undefined]}
                  />
                );
              })}
            </View>
          </StickerCard>

          {selected !== null && (
            <SecondaryButton label="Next question" onPress={onNext} style={styles.nextButton} />
          )}

          <ThemedText type="bodySm" themeColor="mutedForeground" style={styles.debugNote}>
            {adjustment.intervention}
          </ThemedText>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tutorWrapper: {
    position: 'relative',
  },
  tutorCard: {
    marginTop: Spacing.three,
  },
  questionCard: {
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  choices: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  choiceButton: {
    alignSelf: 'stretch',
  },
  nextButton: {
    alignSelf: 'center',
  },
  debugNote: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
