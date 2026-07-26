import { useMemo } from 'react';
import type { ChildProfile } from '@/stores/profile-store';
import { useProfileStore } from '@/stores/profile-store';

/**
 * Stable active-child subscription — never call `getActiveChild()` inside a
 * Zustand selector; that pattern can trip React's max-update-depth guard
 * when combined with store writes during the same render cycle.
 */
export function useActiveChild(): ChildProfile | undefined {
  const activeChildId = useProfileStore((s) => s.activeChildId);
  const children = useProfileStore((s) => s.children);
  return useMemo(() => children.find((c) => c.id === activeChildId), [children, activeChildId]);
}
