import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getFirstNode, getNextNode, getPath, getSortedNodes, pathKey } from '@/features/curriculum';
import type { GradeBand, NodeState, Subject } from '@/features/curriculum';
import { mmkvStorage } from '@/lib/storage';

/** How many recent attempts to weigh when checking the completion threshold. */
const ROLLING_WINDOW = 8;
/** A node can't complete off a single lucky guess. */
const MIN_ATTEMPTS_BEFORE_CHECK = 3;
const MASTERY_MIN_ATTEMPTS = 5;
const MASTERY_ACCURACY = 0.95;

export interface NodeProgress {
  /** Most-recent-last ring buffer, capped at ROLLING_WINDOW. */
  recentResults: boolean[];
  totalAttempts: number;
  totalCorrect: number;
  status: NodeState;
  completedAt?: number;
}

interface PathProgress {
  currentNodeId: string;
  nodes: Record<string, NodeProgress>;
}

interface RecordAnswerResult {
  completedNode: boolean;
  masteredNode: boolean;
}

interface ProgressState {
  paths: Record<string, PathProgress>;

  getCurrentNodeId: (grade: GradeBand, subject: Subject) => string | undefined;
  getNodeState: (grade: GradeBand, subject: Subject, nodeId: string) => NodeState;
  getNodeProgress: (grade: GradeBand, subject: Subject, nodeId: string) => NodeProgress | undefined;
  getPathCompletionRatio: (grade: GradeBand, subject: Subject) => number;
  recordAnswer: (grade: GradeBand, subject: Subject, nodeId: string, correct: boolean) => RecordAnswerResult;
  /**
   * For "lesson experience" methods (chat_tutor, reverse_tutor, video,
   * story_mission) that don't produce a repeatable drill signal — one
   * full pass is sufficient evidence of engagement, so completion isn't
   * gated behind the rolling-accuracy minimum-attempts check the way
   * question/game_3d/trace/speak_practice are.
   */
  completeNodeDirectly: (grade: GradeBand, subject: Subject, nodeId: string) => boolean;
  resetPath: (grade: GradeBand, subject: Subject) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      paths: {},

      getCurrentNodeId: (grade, subject) => {
        const key = pathKey(grade, subject);
        return get().paths[key]?.currentNodeId ?? getFirstNode(grade, subject)?.id;
      },

      getNodeProgress: (grade, subject, nodeId) => {
        const key = pathKey(grade, subject);
        return get().paths[key]?.nodes[nodeId];
      },

      getNodeState: (grade, subject, nodeId) => {
        const state = get();
        const key = pathKey(grade, subject);
        const pathProgress = state.paths[key];
        const nodeProgress = pathProgress?.nodes[nodeId];
        if (nodeProgress?.status === 'completed' || nodeProgress?.status === 'mastered') {
          return nodeProgress.status;
        }

        const currentNodeId = pathProgress?.currentNodeId ?? getFirstNode(grade, subject)?.id;
        if (nodeId === currentNodeId) return 'current';

        const nodes = getSortedNodes(grade, subject);
        const currentOrder = nodes.find((n) => n.id === currentNodeId)?.order ?? 0;
        const thisOrder = nodes.find((n) => n.id === nodeId)?.order ?? Number.POSITIVE_INFINITY;
        // Defensive fallback for nodes ahead of a current pointer that was never recorded per-node.
        return thisOrder < currentOrder ? 'completed' : 'locked';
      },

      getPathCompletionRatio: (grade, subject) => {
        const nodes = getSortedNodes(grade, subject);
        if (nodes.length === 0) return 0;
        const state = get();
        const completedCount = nodes.filter((n) => {
          const s = state.getNodeState(grade, subject, n.id);
          return s === 'completed' || s === 'mastered';
        }).length;
        return completedCount / nodes.length;
      },

      recordAnswer: (grade, subject, nodeId, correct) => {
        const path = getPath(grade, subject);
        const node = path?.nodes.find((n) => n.id === nodeId);
        const key = pathKey(grade, subject);
        const result: RecordAnswerResult = { completedNode: false, masteredNode: false };
        if (!path || !node) return result;

        set((state) => {
          const existingPathProgress: PathProgress = state.paths[key] ?? {
            currentNodeId: getFirstNode(grade, subject)?.id ?? nodeId,
            nodes: {},
          };
          const existingNodeProgress: NodeProgress = existingPathProgress.nodes[nodeId] ?? {
            recentResults: [],
            totalAttempts: 0,
            totalCorrect: 0,
            status: 'current',
          };

          const recentResults = [...existingNodeProgress.recentResults, correct].slice(-ROLLING_WINDOW);
          const totalAttempts = existingNodeProgress.totalAttempts + 1;
          const totalCorrect = existingNodeProgress.totalCorrect + (correct ? 1 : 0);
          const accuracy = recentResults.filter(Boolean).length / recentResults.length;

          let status = existingNodeProgress.status;
          if (status !== 'completed' && status !== 'mastered' && recentResults.length >= MIN_ATTEMPTS_BEFORE_CHECK && accuracy >= node.requiredAccuracy) {
            status = 'completed';
            result.completedNode = true;
          }
          if (status === 'completed' && recentResults.length >= MASTERY_MIN_ATTEMPTS && accuracy >= MASTERY_ACCURACY) {
            status = 'mastered';
            result.masteredNode = true;
          }

          const updatedNodeProgress: NodeProgress = {
            recentResults,
            totalAttempts,
            totalCorrect,
            status,
            completedAt: result.completedNode && !existingNodeProgress.completedAt ? Date.now() : existingNodeProgress.completedAt,
          };

          let currentNodeId = existingPathProgress.currentNodeId;
          if (result.completedNode && currentNodeId === nodeId) {
            const next = getNextNode(grade, subject, nodeId);
            if (next) currentNodeId = next.id;
          }

          return {
            paths: {
              ...state.paths,
              [key]: {
                currentNodeId,
                nodes: { ...existingPathProgress.nodes, [nodeId]: updatedNodeProgress },
              },
            },
          };
        });

        return result;
      },

      completeNodeDirectly: (grade, subject, nodeId) => {
        const key = pathKey(grade, subject);
        let didComplete = false;

        set((state) => {
          const existingPathProgress: PathProgress = state.paths[key] ?? {
            currentNodeId: getFirstNode(grade, subject)?.id ?? nodeId,
            nodes: {},
          };
          const existingNodeProgress: NodeProgress = existingPathProgress.nodes[nodeId] ?? {
            recentResults: [],
            totalAttempts: 0,
            totalCorrect: 0,
            status: 'current',
          };

          if (existingNodeProgress.status === 'completed' || existingNodeProgress.status === 'mastered') {
            return state;
          }
          didComplete = true;

          const updatedNodeProgress: NodeProgress = {
            ...existingNodeProgress,
            status: 'completed',
            completedAt: existingNodeProgress.completedAt ?? Date.now(),
          };

          let currentNodeId = existingPathProgress.currentNodeId;
          if (currentNodeId === nodeId) {
            const next = getNextNode(grade, subject, nodeId);
            if (next) currentNodeId = next.id;
          }

          return {
            paths: {
              ...state.paths,
              [key]: {
                currentNodeId,
                nodes: { ...existingPathProgress.nodes, [nodeId]: updatedNodeProgress },
              },
            },
          };
        });

        return didComplete;
      },

      resetPath: (grade, subject) => {
        const key = pathKey(grade, subject);
        set((state) => {
          const nextPaths = { ...state.paths };
          delete nextPaths[key];
          return { paths: nextPaths };
        });
      },
    }),
    {
      name: 'chiron/progress',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
