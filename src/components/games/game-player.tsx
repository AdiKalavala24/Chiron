import React, { useEffect, useRef, useState } from 'react';
import { QuestionCard, SpeakPracticeCard } from '@/components/learning';
import type { GameId, GamePayload } from '@/features/curriculum';
import { GameShell, type GameSceneVariant } from './game-shell';
import { PhonicsMonsterFeast } from './phonics-monster-feast';
import { MagicCanvasTracing } from './magic-canvas-tracing';
import { BlockTowerBuilder } from './block-tower-builder';
import { EchoSpaceAlien } from './echo-space-alien';

const TARGET_ROUNDS = 5;
const REACTION_PULSE_MS = 700;

/** Themes for the older generic games — the four flagship games own their own look. */
const GAME_THEME: Record<string, { colorHex: string; variant: GameSceneVariant }> = {
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

/** The four purpose-built games, each with its own interaction loop and adaptive easing. */
const FLAGSHIP_GAMES: Partial<Record<GameId, React.ComponentType<GamePlayerProps>>> = {
  phonics_monster: PhonicsMonsterFeast,
  magic_canvas: MagicCanvasTracing,
  block_tower: BlockTowerBuilder,
  echo_alien: EchoSpaceAlien,
};

/**
 * Dispatches to a flagship game when the payload names one; otherwise
 * falls back to the original generic shell, which wraps whichever
 * quiz/speech component fits the content pool with a growing 3D shape.
 *
 * Either way the actual pass/fail grading flows through `onItemAnswered`
 * into the progress store, same as every other drill method.
 */
export function GamePlayer(props: GamePlayerProps) {
  const Flagship = FLAGSHIP_GAMES[props.payload.gameId];
  if (Flagship) return <Flagship {...props} />;
  return <GenericGame {...props} />;
}

function GenericGame({ payload, onItemAnswered, onReadyForNextItem }: GamePlayerProps) {
  const [reactionState, setReactionState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [roundsWon, setRoundsWon] = useState(0);
  const [speakRoundKey, setSpeakRoundKey] = useState(0);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    },
    [],
  );

  const handleAnswered = (correct: boolean) => {
    setReactionState(correct ? 'correct' : 'incorrect');
    if (correct) setRoundsWon((n) => Math.min(TARGET_ROUNDS, n + 1));
    onItemAnswered(correct);

    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setReactionState('idle'), REACTION_PULSE_MS);
  };

  const theme = GAME_THEME[payload.gameId] ?? { colorHex: '#8B5CF6', variant: 'gem' as GameSceneVariant };
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
