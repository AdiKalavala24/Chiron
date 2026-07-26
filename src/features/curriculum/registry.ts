import { ALL_PATHS } from '@content/paths';
import { GRADE_BANDS, SUBJECTS, pathKey as toPathKey, type ContentBlock, type GradeBand, type PathNode, type Subject, type SubjectPath } from './types';

const pathsByKey = new Map<string, SubjectPath>(ALL_PATHS.map((path) => [toPathKey(path.grade, path.subject), path]));

// Fail loudly in development if the hardcoded grid ever has a hole — every
// grade x subject combination must resolve to a path.
if (__DEV__) {
  for (const grade of GRADE_BANDS) {
    for (const subject of SUBJECTS) {
      if (!pathsByKey.has(toPathKey(grade, subject))) {
        console.warn(`[curriculum] Missing hardcoded path for grade ${grade} / subject ${subject}`);
      }
    }
  }
}

export function getPath(grade: GradeBand, subject: Subject): SubjectPath | undefined {
  return pathsByKey.get(toPathKey(grade, subject));
}

export function getSortedNodes(grade: GradeBand, subject: Subject): PathNode[] {
  const path = getPath(grade, subject);
  if (!path) return [];
  return [...path.nodes].sort((a, b) => a.order - b.order);
}

export function getNode(grade: GradeBand, subject: Subject, nodeId: string): PathNode | undefined {
  return getPath(grade, subject)?.nodes.find((n) => n.id === nodeId);
}

export function getFirstNode(grade: GradeBand, subject: Subject): PathNode | undefined {
  return getSortedNodes(grade, subject)[0];
}

export function getNextNode(grade: GradeBand, subject: Subject, currentNodeId: string): PathNode | undefined {
  const sorted = getSortedNodes(grade, subject);
  const index = sorted.findIndex((n) => n.id === currentNodeId);
  if (index === -1) return undefined;
  return sorted[index + 1];
}

export function getBlock(grade: GradeBand, subject: Subject, nodeId: string, blockId: string): ContentBlock | undefined {
  return getNode(grade, subject, nodeId)?.blocks.find((b) => b.id === blockId);
}

/** Appends Gemini-generated blocks to a node's pool without mutating hardcoded content in place. */
export function withExtraBlocks(node: PathNode, extra: ContentBlock[]): PathNode {
  return { ...node, blocks: [...node.blocks, ...extra] };
}
