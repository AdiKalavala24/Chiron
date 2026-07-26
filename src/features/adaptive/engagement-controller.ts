import { useEffect, useRef } from 'react';
import type { GradeBand, Subject, TeachingMethod } from '@/features/curriculum';
import type { AffectSignal } from '@/features/affect';
import { useSessionStore } from '@/stores/session-store';
import { METHOD_FALLBACK as methodFallbackFor } from './method-fallbacks';
import type { BehaviorSignal as EngagementBehaviorSignal } from './types';

const FRUSTRATION_CONFIDENCE_THRESHOLD = 0.6;
const DISTRACTION_CONFIDENCE_THRESHOLD = 0.6;
const CONSECUTIVE_WRONG_THRESHOLD = 3;
const STUCK_ON_ITEM_MS = 90_000;

export interface AdaptiveEvaluation {
  shouldQueueSwitch: boolean;
  toMethod?: TeachingMethod;
  reason?: string;
  alsoRegulation?: boolean;
}

/**
 * Pure decision function — no store access — so it's trivial to unit
 * test the actual adaptive rule independent of React/zustand wiring.
 */
export function evaluateAdaptiveSwitch(
  currentMethod: TeachingMethod,
  behavior: EngagementBehaviorSignal,
  latestAffect: AffectSignal | undefined,
): AdaptiveEvaluation {
  const highFrustration =
    !!latestAffect &&
    (latestAffect.label === 'frustrated' || latestAffect.label === 'distaste') &&
    latestAffect.confidence >= FRUSTRATION_CONFIDENCE_THRESHOLD;
  const distracted = !!latestAffect && latestAffect.label === 'distracted' && latestAffect.confidence >= DISTRACTION_CONFIDENCE_THRESHOLD;
  const strugglingBehaviorally = behavior.consecutiveWrong >= CONSECUTIVE_WRONG_THRESHOLD || behavior.msOnCurrentItem > STUCK_ON_ITEM_MS;

  if (!highFrustration && !distracted && !strugglingBehaviorally) {
    return { shouldQueueSwitch: false };
  }

  const reasonParts: string[] = [];
  if (highFrustration) reasonParts.push(`${latestAffect!.label} detected on camera`);
  if (distracted) reasonParts.push('sustained distraction detected on camera');
  if (strugglingBehaviorally) reasonParts.push(`${behavior.consecutiveWrong} wrong answers in a row`);

  return {
    shouldQueueSwitch: true,
    toMethod: methodFallbackFor[currentMethod],
    reason: reasonParts.join(' and '),
    // Only lead with a regulation beat when frustration ran high, per the locked affect rule.
    alsoRegulation: highFrustration,
  };
}

interface UseAdaptiveControllerArgs {
  currentMethod: TeachingMethod;
  behavior: EngagementBehaviorSignal;
  latestAffect: AffectSignal | undefined;
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
export function useAdaptiveController({ currentMethod, behavior, latestAffect, childId, grade, subject, nodeId }: UseAdaptiveControllerArgs) {
  const queueMethodChange = useSessionStore((s) => s.queueMethodChange);
  const logEvent = useSessionStore((s) => s.logEvent);
  const hasPending = useSessionStore((s) => s.pendingMethodChange !== null);
  const alreadyQueuedRef = useRef(false);

  useEffect(() => {
    // Reset the "already queued" guard whenever the node changes.
    alreadyQueuedRef.current = false;
  }, [nodeId]);

  useEffect(() => {
    if (hasPending || alreadyQueuedRef.current) return;

    const evaluation = evaluateAdaptiveSwitch(currentMethod, behavior, latestAffect);
    if (!evaluation.shouldQueueSwitch || !evaluation.toMethod) return;

    alreadyQueuedRef.current = true;
    queueMethodChange({ fromMethod: currentMethod, toMethod: evaluation.toMethod, reason: evaluation.reason ?? '' }, evaluation.alsoRegulation);
    logEvent({
      childId,
      grade,
      subject,
      nodeId,
      type: 'method_switch_queued',
      detail: { fromMethod: currentMethod, toMethod: evaluation.toMethod, reason: evaluation.reason },
    });
  }, [behavior, latestAffect, currentMethod, hasPending, queueMethodChange, logEvent, childId, grade, subject, nodeId]);
}
