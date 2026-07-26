import React, { useEffect, useRef, useState } from 'react';
import { QuestionCard, SpeakPracticeCard } from '@/components/learning';
import type { GameId, GamePayload } from '@/features/curriculum';
import { GameShell, type GameSceneVariant } from './game-shell';

const TARGET_ROUNDS = 5;
const REACTION_PULSE_MS = 700;

const GAME_THEME: Record<GameId, { colorHex: string; variant: GameSceneVariant }> = {
  number_garden: { colorHex: '#34D399', variant: 'sprout' },
  word_quest: { colorHex: '#8B5CF6', variant: 'gem' },
  ink_trail: { colorHex: '#F472B6', variant: 'trail' },
  echo_tower: { colorHex: '#FBBF24', variant: 'tower' },
};

interface GamePlayerProps {
  payload: GamePayload;
  onItemAnswered: (correct: boolean) => void;
  /** See QuestionCard's prop of the same name — fires right as a new round starts. */
  onReadyForNextItem?: () => void;
}

/**
 * Wraps whichever quiz/speech component fits the game's content pool
 * with the shared 3D shell, tracking a short rolling "rounds won" count
 * purely to drive the scene's growth animation — the actual pass/fail
 * grading always flows through `onItemAnswered` into the progress
 * store, same as every other drill method.
 */
export function GamePlayer({ payload, onItemAnswered, onReadyForNextItem }: GamePlayerProps) {
  const [reactionState, setReactionState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [roundsWon, setRoundsWon] = useState(0);
  const [speakRoundKey, setSpeakRoundKey] = useState(0);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
  }, []);

  const handleAnswered = (correct: boolean) => {
    setReactionState(correct ? 'correct' : 'incorrect');
    if (correct) setRoundsWon((n) => Math.min(TARGET_ROUNDS, n + 1));
    onItemAnswered(correct);

    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setReactionState('idle'), REACTION_PULSE_MS);
  };

  const theme = GAME_THEME[payload.gameId];
  const progressRatio = Math.min(1, roundsWon / TARGET_ROUNDS);
  const usesSpeech = payload.gameId === 'echo_tower' && !!payload.speakPhrases?.length;

  return (
    <GameShell
      skillChip={payload.skillChip}
      roundGoal={payload.roundGoal}
      colorHex={theme.colorHex}
      variant={theme.variant}
      reactionState={reactionState}
      progressRatio={progressRatio}
    >
      {usesSpeech ? (
        <SpeakPracticeCard
          key={speakRoundKey}
          payload={{ instructions: payload.roundGoal, targetPhrases: payload.speakPhrases!, passAccuracy: 0.6 }}
          onPhraseAttempt={handleAnswered}
          onAllPhrasesComplete={() => setSpeakRoundKey((k) => k + 1)}
          onReadyForNextItem={onReadyForNextItem}
        />
      ) : (
        <QuestionCard
          payload={{ instructions: payload.roundGoal, items: payload.items }}
          onItemAnswered={handleAnswered}
          onReadyForNextItem={onReadyForNextItem}
        />
      )}
    </GameShell>
  );
}
