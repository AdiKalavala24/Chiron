import React from 'react';
import type { ContentBlock } from '@/features/curriculum';
import { GamePlayer } from '@/components/games';
import { QuestionCard } from './question-card';
import { VideoCard } from './video-card';
import { ChatTutorCard } from './chat-tutor-card';
import { TraceCanvas } from './trace-canvas';
import { SpeakPracticeCard } from './speak-practice-card';
import { ReverseTutorCard } from './reverse-tutor-card';
import { StoryMissionCard } from './story-mission-card';

interface MethodPlayerProps {
  block: ContentBlock;
  /** Drill methods (question, game_3d, trace, speak_practice) report each graded interaction here. */
  onItemAnswered: (correct: boolean) => void;
  /** trace/speak_practice exhaust their small authored list and need the player to decide: celebrate, or run it again. */
  onDrillPassComplete: () => void;
  /** "Lesson experience" methods (video, chat_tutor, reverse_tutor, story_mission) — one pass always completes the node. */
  onHolisticComplete: () => void;
  /** Drill methods only — the safe boundary for applying a queued adaptive method switch. */
  onReadyForNextItem: () => void;
}

/**
 * Pure dispatch on `block.method` — no state of its own. Remounting this
 * (via a `key` on the caller side) is how the node player gives a drill
 * method a fresh pass after `onDrillPassComplete`.
 */
export function MethodPlayer({ block, onItemAnswered, onDrillPassComplete, onHolisticComplete, onReadyForNextItem }: MethodPlayerProps) {
  switch (block.method) {
    case 'question':
      return <QuestionCard payload={block.payload} onItemAnswered={onItemAnswered} onReadyForNextItem={onReadyForNextItem} />;
    case 'game_3d':
      return <GamePlayer payload={block.payload} onItemAnswered={onItemAnswered} onReadyForNextItem={onReadyForNextItem} />;
    case 'video':
      return (
        <VideoCard
          payload={block.payload}
          onItemAnswered={onItemAnswered}
          onFinished={onHolisticComplete}
        />
      );
    case 'chat_tutor':
      return <ChatTutorCard payload={block.payload} onComplete={onHolisticComplete} />;
    case 'trace':
      return (
        <TraceCanvas payload={block.payload} onGlyphAttempt={onItemAnswered} onAllGlyphsComplete={onDrillPassComplete} onReadyForNextItem={onReadyForNextItem} />
      );
    case 'speak_practice':
      return (
        <SpeakPracticeCard
          payload={block.payload}
          onPhraseAttempt={onItemAnswered}
          onAllPhrasesComplete={onDrillPassComplete}
          onReadyForNextItem={onReadyForNextItem}
        />
      );
    case 'reverse_tutor':
      return <ReverseTutorCard payload={block.payload} onComplete={onHolisticComplete} />;
    case 'story_mission':
      return <StoryMissionCard payload={block.payload} onItemAnswered={onItemAnswered} onFinished={onHolisticComplete} />;
    case 'regulation':
      // Regulation is presented as its own full screen (app/kid/regulation.tsx), never as a node block.
      return null;
    default:
      return null;
  }
}

export const DRILL_METHODS = ['question', 'game_3d', 'trace', 'speak_practice'] as const;
export const HOLISTIC_METHODS = ['video', 'chat_tutor', 'reverse_tutor', 'story_mission'] as const;
