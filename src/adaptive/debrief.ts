import type { InteractionEvent } from '@/adaptive/types';

/**
 * Turns a session's raw event history into the kind of specific, human
 * pickup-line debrief a good camp counselor gives ("she lit up on X, flinched
 * on Y") instead of a bare progress-bar dashboard.
 *
 * This is a rule-based stand-in for the real version: in production, the
 * session transcript (this same event list, plus the tutor's own turns)
 * would be handed to Gemini with a prompt asking for exactly this kind of
 * narrative — see `@/services/llm.ts`. Keeping the logic here rule-based
 * means the demo is honest about what's actually running right now.
 */
export function generateDebrief(history: InteractionEvent[]): string {
  if (history.length === 0) {
    return "No lesson session yet today — once your child finishes one, you'll see a real debrief here instead of a progress bar.";
  }

  const correct = history.filter((e) => e.correct);
  const missed = history.filter((e) => !e.correct);

  const fastest = [...correct].sort((a, b) => a.responseTimeMs - b.responseTimeMs)[0];
  const slowest = [...history].sort((a, b) => b.responseTimeMs - a.responseTimeMs)[0];

  const parts: string[] = [];

  if (fastest?.questionLabel) {
    parts.push(`She lit up on "${fastest.questionLabel}" — answered it almost instantly.`);
  }

  if (missed.length > 0) {
    const missedLabels = missed.map((e) => e.questionLabel).filter(Boolean);
    if (missedLabels.length > 0) {
      parts.push(
        `Hesitated on ${missedLabels.length > 1 ? 'a couple of questions' : `"${missedLabels[0]}"`} — worth revisiting that together, low-key, before the next session.`,
      );
    }
  } else if (correct.length === history.length) {
    parts.push('Clean sweep today — no wrong answers, so it may be time to nudge the difficulty up.');
  }

  if (slowest && slowest.responseTimeMs > 9000 && slowest.questionLabel) {
    parts.push(`Went quiet for a bit on "${slowest.questionLabel}" — that's usually attention drifting, not difficulty, so a quick break helped.`);
  }

  if (parts.length === 0) {
    parts.push('Steady session overall — nothing that needed an intervention.');
  }

  return parts.join(' ');
}
