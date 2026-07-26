import type { Subject } from '@/features/curriculum';
import type { SessionEvent } from '@/stores/session-store';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Turns one raw session event into the same kind of one-line, plain-
 * English note a human observer would jot down — e.g. "Style shifted
 * after frustrated detected on camera during Fractions Drill -> switched
 * to Number Garden game." Used for both the on-screen activity log and
 * as the raw material fed into the Gemini narrative-debrief prompt.
 */
export function describeEvent(event: SessionEvent): string {
  const subjectLabel = capitalize(event.subject);
  const nodeTitle = typeof event.detail.nodeTitle === 'string' ? event.detail.nodeTitle : event.nodeId;

  switch (event.type) {
    case 'node_started':
      return `Started "${nodeTitle}" in ${subjectLabel}.`;
    case 'node_completed':
      return `Completed "${nodeTitle}" in ${subjectLabel}.`;
    case 'node_mastered':
      return `Mastered "${nodeTitle}" in ${subjectLabel} with near-perfect accuracy.`;
    case 'method_switch_queued':
    case 'method_switch_applied': {
      const reason = typeof event.detail.reason === 'string' && event.detail.reason ? event.detail.reason : 'a struggle signal';
      return `Style shifted after ${reason} during "${nodeTitle}" -> switched to ${event.detail.toMethod}.`;
    }
    case 'regulation_triggered':
      return `Took a short reset break (${event.detail.activity ?? 'breathing'}) during ${subjectLabel}.`;
    case 'regulation_completed':
      return `Finished a reset break and returned to ${subjectLabel}.`;
    case 'affect_signal':
      return `Camera noticed ${event.detail.label ?? 'a shift in mood'} during ${subjectLabel}.`;
    case 'item_answered':
      return `Answered a question ${event.detail.correct ? 'correctly' : 'incorrectly'} in ${subjectLabel} ("${nodeTitle}").`;
    default:
      return `${event.type} in ${subjectLabel}.`;
  }
}

export interface SubjectStats {
  subject: Subject;
  attempts: number;
  correct: number;
  accuracy: number;
  nodesCompleted: number;
  nodesMastered: number;
  methodSwitches: number;
}

const EMPTY_STATS = (subject: Subject): SubjectStats => ({
  subject,
  attempts: 0,
  correct: 0,
  accuracy: 0,
  nodesCompleted: 0,
  nodesMastered: 0,
  methodSwitches: 0,
});

export function summarizeStats(events: SessionEvent[]): SubjectStats[] {
  const bySubject = new Map<Subject, SubjectStats>();

  for (const event of events) {
    const stats = bySubject.get(event.subject) ?? EMPTY_STATS(event.subject);

    if (event.type === 'item_answered') {
      stats.attempts += 1;
      if (event.detail.correct) stats.correct += 1;
    } else if (event.type === 'node_completed') {
      stats.nodesCompleted += 1;
    } else if (event.type === 'node_mastered') {
      stats.nodesMastered += 1;
    } else if (event.type === 'method_switch_applied') {
      stats.methodSwitches += 1;
    }

    bySubject.set(event.subject, stats);
  }

  for (const stats of bySubject.values()) {
    stats.accuracy = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
  }

  return [...bySubject.values()].sort((a, b) => b.attempts - a.attempts);
}

/** The most narratively interesting events — masteries and method switches — for the debrief prompt and highlight cards. */
export function highlightEvents(events: SessionEvent[], limit = 8): SessionEvent[] {
  const interesting = events.filter((e) => e.type === 'node_mastered' || e.type === 'method_switch_applied' || e.type === 'method_switch_queued' || e.type === 'regulation_triggered');
  return interesting.slice(-limit);
}
