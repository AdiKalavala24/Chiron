import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GradeBand, Subject, TeachingMethod } from '@/features/curriculum';
import { makeId } from '@/lib/id';
import { mmkvStorage } from '@/lib/storage';

/** Capped so MMKV doesn't grow without bound; plenty for a rolling parent-analytics window. */
const MAX_EVENTS = 500;

export type SessionEventType =
  | 'node_started'
  | 'item_answered'
  | 'node_completed'
  | 'node_mastered'
  | 'method_switch_queued'
  | 'method_switch_applied'
  | 'regulation_triggered'
  | 'regulation_completed'
  | 'affect_signal';

export interface SessionEvent {
  id: string;
  at: number;
  childId: string;
  grade: GradeBand;
  subject: Subject;
  nodeId: string;
  type: SessionEventType;
  detail: Record<string, unknown>;
}

export interface PendingMethodChange {
  fromMethod: TeachingMethod;
  toMethod: TeachingMethod;
  /** Human-readable cause, e.g. "frustration during fractions drill" — feeds parent analytics verbatim. */
  reason: string;
  queuedAt: number;
}

interface SessionState {
  events: SessionEvent[];
  pendingMethodChange: PendingMethodChange | null;
  pendingRegulation: boolean;

  logEvent: (event: Omit<SessionEvent, 'id' | 'at'>) => void;
  eventsForChild: (childId: string, sinceMs?: number) => SessionEvent[];

  /** Adaptive Controller calls this the moment it decides a switch is warranted — never applied mid-item. */
  queueMethodChange: (change: Omit<PendingMethodChange, 'queuedAt'>, alsoQueueRegulation?: boolean) => void;
  /** The player calls this only after the current item/question fully resolves. Clears the queue. */
  consumePendingMethodChange: () => PendingMethodChange | null;
  clearPendingRegulation: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      events: [],
      pendingMethodChange: null,
      pendingRegulation: false,

      logEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: makeId('evt'), at: Date.now() }].slice(-MAX_EVENTS),
        })),

      eventsForChild: (childId, sinceMs) => {
        const events = get().events.filter((e) => e.childId === childId);
        return sinceMs ? events.filter((e) => e.at >= sinceMs) : events;
      },

      queueMethodChange: (change, alsoQueueRegulation = false) =>
        set({
          pendingMethodChange: { ...change, queuedAt: Date.now() },
          pendingRegulation: alsoQueueRegulation,
        }),

      consumePendingMethodChange: () => {
        const pending = get().pendingMethodChange;
        if (pending) set({ pendingMethodChange: null });
        return pending;
      },

      clearPendingRegulation: () => set({ pendingRegulation: false }),
    }),
    {
      name: 'chiron/session',
      storage: createJSONStorage(() => mmkvStorage),
      // Never persist the live "waiting to switch" flags across app restarts — only the event log.
      partialize: (state) => ({ events: state.events }),
    },
  ),
);
