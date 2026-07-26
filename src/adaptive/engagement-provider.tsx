import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { getAdaptiveAdjustment, type AdaptiveAdjustment } from '@/adaptive/adaptive-theme';
import { deriveEngagementState } from '@/adaptive/engagement-engine';
import type { EngagementState, InteractionEvent } from '@/adaptive/types';

type EngagementContextValue = {
  state: EngagementState;
  adjustment: AdaptiveAdjustment;
  history: InteractionEvent[];
  recordAttempt: (correct: boolean, responseTimeMs: number, questionLabel?: string) => void;
  reset: () => void;
};

const EngagementContext = createContext<EngagementContextValue | null>(null);

/**
 * Holds one lesson session's worth of answer history in memory and derives
 * the child's engagement state from it. Wraps the whole app (see
 * `src/app/_layout.tsx`) so the Lesson screen can record attempts and the
 * Parent Debrief screen can read the same session back afterward.
 *
 * In production this would also persist events to the backend (see
 * `@/services/api`) so a debrief survives an app restart and rolls up across
 * sessions — deliberately kept in-memory here since that's a backend/infra
 * decision, not a UI one.
 */
export function EngagementProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<InteractionEvent[]>([]);

  const recordAttempt = useCallback((correct: boolean, responseTimeMs: number, questionLabel?: string) => {
    setHistory((prev) => [...prev, { timestamp: Date.now(), correct, responseTimeMs, questionLabel }]);
  }, []);

  const reset = useCallback(() => setHistory([]), []);

  const state = useMemo(() => deriveEngagementState(history), [history]);
  const adjustment = useMemo(() => getAdaptiveAdjustment(state), [state]);

  const value = useMemo(
    () => ({ state, adjustment, history, recordAttempt, reset }),
    [state, adjustment, history, recordAttempt, reset],
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

export function useEngagement() {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error('useEngagement must be used within an EngagementProvider');
  return ctx;
}
