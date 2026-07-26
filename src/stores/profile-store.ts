import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GradeBand } from '@/features/curriculum';
import { makeId } from '@/lib/id';
import { mmkvStorage } from '@/lib/storage';

export interface ChildProfile {
  id: string;
  name: string;
  grade: GradeBand;
  createdAt: number;
}

interface ProfileState {
  parentName: string | null;
  children: ChildProfile[];
  activeChildId: string | null;

  setParentName: (name: string) => void;
  /** Creates a child if none exist yet, otherwise returns the first one — Phase 1 keeps kid entry frictionless. */
  ensureActiveChild: () => ChildProfile;
  addChild: (name: string, grade: GradeBand) => ChildProfile;
  setActiveChild: (id: string) => void;
  setChildGrade: (id: string, grade: GradeBand) => void;
  getActiveChild: () => ChildProfile | undefined;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      parentName: null,
      children: [],
      activeChildId: null,

      setParentName: (name) => set({ parentName: name }),

      ensureActiveChild: () => {
        const state = get();
        const existing = state.children.find((c) => c.id === state.activeChildId) ?? state.children[0];
        if (existing) {
          if (state.activeChildId !== existing.id) set({ activeChildId: existing.id });
          return existing;
        }
        const child: ChildProfile = { id: makeId('child'), name: 'Explorer', grade: 'K', createdAt: Date.now() };
        set({ children: [child], activeChildId: child.id });
        return child;
      },

      addChild: (name, grade) => {
        const child: ChildProfile = { id: makeId('child'), name, grade, createdAt: Date.now() };
        set((state) => ({ children: [...state.children, child], activeChildId: child.id }));
        return child;
      },

      setActiveChild: (id) => set({ activeChildId: id }),

      setChildGrade: (id, grade) =>
        set((state) => ({
          children: state.children.map((c) => (c.id === id ? { ...c, grade } : c)),
        })),

      getActiveChild: () => {
        const state = get();
        return state.children.find((c) => c.id === state.activeChildId);
      },
    }),
    {
      name: 'chiron/profile',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
