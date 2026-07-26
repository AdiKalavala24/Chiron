import { create } from 'zustand';
import type { Subject, TeachingMethod } from '@/features/curriculum';
import type { AffectLabel, AffectReadingOutcome } from '@/features/affect/types';
import type { ClassifierDiagnostics } from '@/features/affect/face-classifier';
import { makeId } from '@/lib/id';

/**
 * Deliberately NOT persisted, and deliberately not folded into
 * `session-store`. Two reasons:
 *
 * 1. Volume. The camera engine samples every ~5s, so this log grows ~720
 *    entries/hour. The session log is capped at 500 and parent analytics
 *    reads it — writing sensing ticks there would evict the completions
 *    and switches those stats depend on within minutes.
 * 2. Privacy. These entries are face-derived readings about a child.
 *    Keeping them in memory means they exist for the current session,
 *    for verifying the pipeline works, and then they're gone — rather
 *    than accumulating a durable biometric record on the device.
 *
 * The practical consequence: the log resets on app restart. That's the
 * intended tradeoff for a live-verification tool.
 */
const MAX_ENTRIES = 400;

export type AffectDecision =
  /** Thresholds crossed and a method switch was queued. */
  | 'switch_queued'
  /** Thresholds crossed but the node had no alternative method authored, so content generation was requested. */
  | 'content_needed';

interface AffectAuditBase {
  id: string;
  at: number;
  childId: string;
  subject: Subject;
  nodeId: string;
}

export type AffectAuditEntry = AffectAuditBase &
  (
    | {
        kind: 'reading';
        outcome: AffectReadingOutcome;
        /** Present only when `outcome` is `classified` or `no_face`. */
        label?: AffectLabel;
        confidence?: number;
        diagnostics?: ClassifierDiagnostics;
        /** Error text for the failure outcomes. */
        detail?: string;
      }
    | {
        kind: 'decision';
        decision: AffectDecision;
        fromMethod: TeachingMethod;
        toMethod?: TeachingMethod;
        reason: string;
        /** Consecutive qualifying distracted readings at the moment of the decision. */
        distractionStreak: number;
      }
  );

/**
 * A plain `Omit` over a union collapses it to just the shared keys, which
 * would reject `outcome`/`decision` at every call site. Distributing keeps
 * each variant intact.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type NewAffectAuditEntry = DistributiveOmit<AffectAuditEntry, 'id' | 'at'>;

interface AffectAuditState {
  entries: AffectAuditEntry[];
  /** Called on every camera tick (including failures) and on every adaptive decision. */
  record: (entry: NewAffectAuditEntry) => void;
  clear: () => void;
  entriesForChild: (childId: string) => AffectAuditEntry[];
}

/**
 * Mirrors the notable entries to the Metro console during development, so
 * the pipeline can be watched from a terminal while testing without
 * navigating to the parent screen. Neutral/engaged ticks are the boring
 * majority and would drown the console — they're still in the in-app log.
 */
function logToConsole(entry: NewAffectAuditEntry): void {
  if (!__DEV__) return;

  if (entry.kind === 'decision') {
    console.log(`[affect-audit] DECISION ${entry.decision}: ${entry.fromMethod} -> ${entry.toMethod ?? '?'} (streak ${entry.distractionStreak}) — ${entry.reason}`);
    return;
  }

  if (entry.outcome === 'capture_failed' || entry.outcome === 'classifier_unavailable') {
    console.warn(`[affect-audit] ${entry.outcome}: ${entry.detail ?? 'no detail'}`);
    return;
  }

  const notable = entry.label === 'distracted' || entry.label === 'frustrated' || entry.label === 'distaste';
  if (!notable) return;

  const confidence = entry.confidence !== undefined ? `${Math.round(entry.confidence * 100)}%` : '?';
  const head = entry.diagnostics?.headOffAxisDeg;
  const frustration = entry.diagnostics?.frustrationScore;
  const why = [
    head !== undefined ? `head ${Math.round(head)}deg` : null,
    frustration !== undefined ? `frustration ${frustration.toFixed(2)}` : null,
    entry.outcome === 'no_face' ? 'no face in frame' : null,
  ]
    .filter(Boolean)
    .join(', ');
  console.log(`[affect-audit] ${entry.label} (${confidence})${why ? ` — ${why}` : ''}`);
}

export const useAffectAuditStore = create<AffectAuditState>()((set, get) => ({
  entries: [],

  record: (entry) => {
    logToConsole(entry);
    set((state) => ({
      entries: [...state.entries, { ...entry, id: makeId('afx'), at: Date.now() } as AffectAuditEntry].slice(-MAX_ENTRIES),
    }));
  },

  clear: () => set({ entries: [] }),

  entriesForChild: (childId) => get().entries.filter((e) => e.childId === childId),
}));

export interface AffectAuditSummary {
  totalReadings: number;
  /** Readings where the model ran and returned a face. */
  classified: number;
  distracted: number;
  frustrated: number;
  noFace: number;
  failed: number;
  switchesQueued: number;
  contentRequests: number;
  /** Longest run of consecutive qualifying distracted readings seen in this window. */
  longestDistractedRun: number;
  firstAt?: number;
  lastAt?: number;
}

/**
 * Rolls the raw entries into the counts the viewer header shows. Kept
 * here (not in the screen) so it stays a pure function that's easy to
 * check against a fixture.
 */
export function summarizeAffectAudit(entries: AffectAuditEntry[], distractionConfidenceThreshold: number): AffectAuditSummary {
  const summary: AffectAuditSummary = {
    totalReadings: 0,
    classified: 0,
    distracted: 0,
    frustrated: 0,
    noFace: 0,
    failed: 0,
    switchesQueued: 0,
    contentRequests: 0,
    longestDistractedRun: 0,
  };

  let currentRun = 0;

  for (const entry of entries) {
    if (summary.firstAt === undefined) summary.firstAt = entry.at;
    summary.lastAt = entry.at;

    if (entry.kind === 'decision') {
      if (entry.decision === 'switch_queued') summary.switchesQueued += 1;
      else summary.contentRequests += 1;
      continue;
    }

    summary.totalReadings += 1;

    if (entry.outcome === 'capture_failed' || entry.outcome === 'classifier_unavailable') {
      summary.failed += 1;
      // A failed tick isn't a "not distracted" reading — it's no reading
      // at all, so it neither extends nor breaks the run.
      continue;
    }

    if (entry.outcome === 'no_face') summary.noFace += 1;
    if (entry.outcome === 'classified') summary.classified += 1;

    if (entry.label === 'distracted') summary.distracted += 1;
    if (entry.label === 'frustrated' || entry.label === 'distaste') summary.frustrated += 1;

    // Mirrors `isQualifyingDistraction` in the engagement controller so
    // the run length shown here matches the one that actually gates a switch.
    const qualifies = entry.label === 'distracted' && (entry.confidence ?? 0) >= distractionConfidenceThreshold;
    currentRun = qualifies ? currentRun + 1 : 0;
    summary.longestDistractedRun = Math.max(summary.longestDistractedRun, currentRun);
  }

  return summary;
}
