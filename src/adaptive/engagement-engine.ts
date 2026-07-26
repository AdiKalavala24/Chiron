import type { EngagementState, InteractionEvent } from '@/adaptive/types';

/** Only the recent window matters — a rough hour ago shouldn't color this instant. */
const WINDOW_SIZE = 4;

/** Answering this fast, twice in a row wrong, reads as guessing-through-frustration rather than thinking. */
const FRUSTRATION_RESPONSE_MS = 2500;
const FRUSTRATION_WRONG_STREAK = 2;

/** Answering this slowly (right or wrong) reads as attention having drifted, not difficulty. */
const BOREDOM_RESPONSE_MS = 9000;

const CELEBRATION_STREAK = 2;

function trailingWrongStreak(history: InteractionEvent[]): InteractionEvent[] {
  const streak: InteractionEvent[] = [];
  for (let i = history.length - 1; i >= 0 && !history[i].correct; i--) {
    streak.unshift(history[i]);
  }
  return streak;
}

function trailingCorrectStreak(history: InteractionEvent[]): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0 && history[i].correct; i--) streak++;
  return streak;
}

/**
 * Derives the child's current engagement state from their recent answer
 * history. This is the "counselor's instinct" heuristic: a good camp
 * counselor doesn't need a heart-rate monitor to tell "about to give up"
 * apart from "just needs a sec" — retry speed and pattern are enough for a
 * buildable v1.
 */
export function deriveEngagementState(history: InteractionEvent[]): EngagementState {
  if (history.length === 0) return 'engaged';

  const recent = history.slice(-WINDOW_SIZE);

  const wrongStreak = trailingWrongStreak(recent);
  if (wrongStreak.length >= FRUSTRATION_WRONG_STREAK) {
    const avgResponse = wrongStreak.reduce((sum, e) => sum + e.responseTimeMs, 0) / wrongStreak.length;
    if (avgResponse <= FRUSTRATION_RESPONSE_MS) return 'frustrated';
  }

  if (trailingCorrectStreak(recent) >= CELEBRATION_STREAK) return 'celebrating';

  const avgResponseTime = recent.reduce((sum, e) => sum + e.responseTimeMs, 0) / recent.length;
  if (avgResponseTime >= BOREDOM_RESPONSE_MS) return 'bored';

  return 'engaged';
}
