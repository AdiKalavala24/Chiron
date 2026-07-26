import { useEffect, useRef } from 'react';
import type { GradeBand, Subject, TeachingMethod } from '@/features/curriculum';
import type { AffectSignal } from '@/features/affect';
import { useSessionStore } from '@/stores/session-store';
import { useAffectAuditStore } from '@/stores/affect-audit-store';
import { METHOD_FALLBACK, pickAvailableFallback } from './method-fallbacks';
import type { BehaviorSignal as EngagementBehaviorSignal } from './types';

const FRUSTRATION_CONFIDENCE_THRESHOLD = 0.6;
const DISTRACTION_CONFIDENCE_THRESHOLD = 0.6;
/**
 * How many qualifying "distracted" camera reads in a row count as
 * *consistent* distraction rather than a single glance away. The camera
 * engine samples every 5s (see SIGNAL_INTERVAL_MS in
 * camera-affect-engine.tsx), so 3 in a row means distraction held for
 * roughly the last 10-15 seconds, not just one frame.
 */
const DISTRACTION_STREAK_THRESHOLD = 3;
const CONSECUTIVE_WRONG_THRESHOLD = 3;
const STUCK_ON_ITEM_MS = 90_000;

/**
 * Exported so the audit log reports runs against exactly the bar that
 * gates a real switch — if these are ever tuned, the log follows rather
 * than quietly disagreeing with the controller.
 */
export const ADAPTIVE_THRESHOLDS = {
  distractionConfidence: DISTRACTION_CONFIDENCE_THRESHOLD,
  distractionStreak: DISTRACTION_STREAK_THRESHOLD,
  frustrationConfidence: FRUSTRATION_CONFIDENCE_THRESHOLD,
} as const;

function isQualifyingDistraction(signal: AffectSignal | undefined): boolean {
  return !!signal && signal.label === 'distracted' && signal.confidence >= DISTRACTION_CONFIDENCE_THRESHOLD;
}

export interface AdaptiveEvaluation {
  shouldQueueSwitch: boolean;
  toMethod?: TeachingMethod;
  reason?: string;
  alsoRegulation?: boolean;
  /**
   * Set whenever a switch was warranted but the node has no block for any
   * ranked fallback yet — the top-ranked method the caller could ask
   * Gemini to generate on the fly so the next evaluation has somewhere to
   * send the kid. Absent when a switch was queued normally, or when
   * nothing warranted a switch at all.
   */
  neededMethod?: TeachingMethod;
}

/**
 * Pure decision function — no store access — so it's trivial to unit
 * test the actual adaptive rule independent of React/zustand wiring.
 *
 * `distractionStreak` is the count of consecutive qualifying "distracted"
 * reads ending at `latestAffect`, computed by the caller (see
 * `useAdaptiveController`) — passed in explicitly rather than derived
 * here so this stays a pure function of its arguments.
 *
 * `availableMethods` is the set of methods the current node actually has
 * blocks for. A switch is only ever queued to a method that's really
 * there, so the node player can never be handed an inapplicable target.
 */
export function evaluateAdaptiveSwitch(
  currentMethod: TeachingMethod,
  behavior: EngagementBehaviorSignal,
  latestAffect: AffectSignal | undefined,
  distractionStreak: number,
  availableMethods: readonly TeachingMethod[],
): AdaptiveEvaluation {
  const highFrustration =
    !!latestAffect &&
    (latestAffect.label === 'frustrated' || latestAffect.label === 'distaste') &&
    latestAffect.confidence >= FRUSTRATION_CONFIDENCE_THRESHOLD;
  const consistentlyDistracted = distractionStreak >= DISTRACTION_STREAK_THRESHOLD;
  const strugglingBehaviorally = behavior.consecutiveWrong >= CONSECUTIVE_WRONG_THRESHOLD || behavior.msOnCurrentItem > STUCK_ON_ITEM_MS;

  if (!highFrustration && !consistentlyDistracted && !strugglingBehaviorally) {
    return { shouldQueueSwitch: false };
  }

  // Built before the no-fallback early return so the "we needed content"
  // path carries the same explanation as a real switch — that reason is
  // the whole value of the entry in the audit log.
  const reasonParts: string[] = [];
  if (highFrustration) reasonParts.push(`${latestAffect!.label} detected on camera`);
  if (consistentlyDistracted) reasonParts.push(`consistent distraction detected on camera (${distractionStreak} reads in a row)`);
  if (strugglingBehaviorally) reasonParts.push(`${behavior.consecutiveWrong} wrong answers in a row`);
  const reason = reasonParts.join(' and ');

  const toMethod = pickAvailableFallback(currentMethod, availableMethods);
  if (!toMethod) {
    // Nothing else authored on this node to switch to — don't queue a
    // switch the player can't apply. (Frustration/distraction still got
    // logged by the caller either way.) Report the top-ranked fallback so
    // the caller can go generate it instead of just giving up.
    return { shouldQueueSwitch: false, neededMethod: METHOD_FALLBACK[currentMethod][0], reason };
  }

  return {
    shouldQueueSwitch: true,
    toMethod,
    reason,
    // Only lead with a regulation beat when frustration ran high, per the locked affect rule.
    alsoRegulation: highFrustration,
  };
}

interface UseAdaptiveControllerArgs {
  currentMethod: TeachingMethod;
  behavior: EngagementBehaviorSignal;
  latestAffect: AffectSignal | undefined;
  /** Methods the current node actually has blocks for — bounds what a queued switch can target. */
  availableMethods: readonly TeachingMethod[];
  /**
   * Called when a switch was warranted but no block for any fallback
   * method exists yet, so the node player can generate one on the fly
   * (e.g. via Gemini) and add it to `availableMethods`.
   *
   * Fires at most **once per method per node**. That cap is load-bearing:
   * generation is not guaranteed to actually yield the requested method
   * (the offline fallback in `generateLessonBlocks` reshuffles the node's
   * existing blocks, so `availableMethods` can come back unchanged), and
   * without the cap this would re-request forever.
   */
  onNeedFallbackContent?: (method: TeachingMethod) => void;
  childId: string;
  grade: GradeBand;
  subject: Subject;
  nodeId: string;
}

/**
 * Watches behavior + affect and queues a method switch the moment
 * either crosses threshold — but never applies it. The node player is
 * responsible for calling `consumePendingMethodChange` from the session
 * store once the current item/question fully resolves, per the locked
 * rule: queue anytime, apply only between items.
 */
export function useAdaptiveController({
  currentMethod,
  behavior,
  latestAffect,
  availableMethods,
  onNeedFallbackContent,
  childId,
  grade,
  subject,
  nodeId,
}: UseAdaptiveControllerArgs) {
  const queueMethodChange = useSessionStore((s) => s.queueMethodChange);
  const logEvent = useSessionStore((s) => s.logEvent);
  const recordAudit = useAffectAuditStore((s) => s.record);
  const hasPending = useSessionStore((s) => s.pendingMethodChange !== null);
  const alreadyQueuedRef = useRef(false);
  const distractionStreakRef = useRef(0);
  const lastAffectAtRef = useRef<number | undefined>(undefined);
  const wasPendingRef = useRef(hasPending);
  // Methods already requested on this node. Entries are never removed
  // until the node changes — see `onNeedFallbackContent` for why retrying
  // would spin forever rather than eventually succeed.
  const requestedFallbacksRef = useRef<Set<TeachingMethod>>(new Set());
  const onNeedFallbackContentRef = useRef(onNeedFallbackContent);
  // `.at` of the last affect sample already "spent" triggering a switch.
  // Without this, re-arming after a switch applies would let the exact
  // same stale camera reading that caused it immediately cascade into a
  // second (or third...) switch before the kid ever sees the new method —
  // `behavior` gets reset by the node player on apply, but nothing resets
  // `latestAffect`, so this is the affect-side equivalent of that reset.
  const consumedAffectAtRef = useRef(0);

  useEffect(() => {
    onNeedFallbackContentRef.current = onNeedFallbackContent;
  }, [onNeedFallbackContent]);

  useEffect(() => {
    // Reset everything whenever the node changes.
    alreadyQueuedRef.current = false;
    distractionStreakRef.current = 0;
    lastAffectAtRef.current = undefined;
    consumedAffectAtRef.current = 0;
    requestedFallbacksRef.current.clear();
  }, [nodeId]);

  useEffect(() => {
    // Once a previously-queued change has been consumed (applied by the
    // node player between items), re-arm so a still-struggling kid can
    // trigger another switch later in the same node — but only once a
    // *fresh* camera sample comes in, not off the one that just fired.
    if (wasPendingRef.current && !hasPending) {
      alreadyQueuedRef.current = false;
      distractionStreakRef.current = 0;
      consumedAffectAtRef.current = latestAffect?.at ?? consumedAffectAtRef.current;
    }
    wasPendingRef.current = hasPending;
  }, [hasPending, latestAffect]);

  useEffect(() => {
    // Advance the consecutive-distraction streak exactly once per new
    // camera sample — guarded by `.at` so this doesn't double-count when
    // the effect re-runs for an unrelated dependency (e.g. `behavior`).
    if (latestAffect && latestAffect.at !== lastAffectAtRef.current) {
      lastAffectAtRef.current = latestAffect.at;
      distractionStreakRef.current = isQualifyingDistraction(latestAffect) ? distractionStreakRef.current + 1 : 0;
    }

    if (hasPending || alreadyQueuedRef.current) return;

    // Don't act on an affect sample that already triggered the last switch.
    const freshAffect = latestAffect && latestAffect.at > consumedAffectAtRef.current ? latestAffect : undefined;

    const evaluation = evaluateAdaptiveSwitch(currentMethod, behavior, freshAffect, distractionStreakRef.current, availableMethods);

    if (!evaluation.shouldQueueSwitch || !evaluation.toMethod) {
      // A switch was wanted but nothing on this node can serve it yet —
      // ask the caller to generate that method's content, at most once
      // per method per node.
      const needed = evaluation.neededMethod;
      if (needed && !requestedFallbacksRef.current.has(needed)) {
        requestedFallbacksRef.current.add(needed);
        recordAudit({
          kind: 'decision',
          childId,
          subject,
          nodeId,
          decision: 'content_needed',
          fromMethod: currentMethod,
          toMethod: needed,
          reason: evaluation.reason ?? '',
          distractionStreak: distractionStreakRef.current,
        });
        onNeedFallbackContentRef.current?.(needed);
      }
      return;
    }

    alreadyQueuedRef.current = true;
    queueMethodChange({ fromMethod: currentMethod, toMethod: evaluation.toMethod, reason: evaluation.reason ?? '' }, evaluation.alsoRegulation);
    recordAudit({
      kind: 'decision',
      childId,
      subject,
      nodeId,
      decision: 'switch_queued',
      fromMethod: currentMethod,
      toMethod: evaluation.toMethod,
      reason: evaluation.reason ?? '',
      distractionStreak: distractionStreakRef.current,
    });
    logEvent({
      childId,
      grade,
      subject,
      nodeId,
      type: 'method_switch_queued',
      detail: { fromMethod: currentMethod, toMethod: evaluation.toMethod, reason: evaluation.reason },
    });
  }, [behavior, latestAffect, currentMethod, availableMethods, hasPending, queueMethodChange, logEvent, recordAudit, childId, grade, subject, nodeId]);
}
