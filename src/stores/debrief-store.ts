import { create } from 'zustand';
import { generateNarrativeDebrief, type NarrativeDebrief } from '@/features/gemini';
import type { SessionEvent } from './session-store';

interface DebriefState {
  byChildId: Record<string, NarrativeDebrief>;
  loadingChildId: string | null;
  /** Cached per child for the life of the app session — regenerating fresh on every screen visit would mean a Gemini call every time a parent glances at the tab. */
  fetchDebrief: (childId: string, childName: string, events: SessionEvent[]) => Promise<NarrativeDebrief>;
  invalidate: (childId: string) => void;
}

export const useDebriefStore = create<DebriefState>((set, get) => ({
  byChildId: {},
  loadingChildId: null,

  fetchDebrief: async (childId, childName, events) => {
    const cached = get().byChildId[childId];
    if (cached) return cached;

    set({ loadingChildId: childId });
    const result = await generateNarrativeDebrief(childName, events);
    set((state) => ({ byChildId: { ...state.byChildId, [childId]: result }, loadingChildId: state.loadingChildId === childId ? null : state.loadingChildId }));
    return result;
  },

  invalidate: (childId) =>
    set((state) => {
      const next = { ...state.byChildId };
      delete next[childId];
      return { byChildId: next };
    }),
}));
