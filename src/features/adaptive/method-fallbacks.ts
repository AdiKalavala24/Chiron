import type { TeachingMethod } from '@/features/curriculum';

/**
 * Where the Adaptive Controller sends a struggling kid next, per current
 * method — ranked, not a single fixed target. Most hardcoded nodes only
 * author one or two of these methods (see content/paths/*), so the first
 * choice frequently isn't actually present on the current node; the list
 * gives `pickAvailableFallback` somewhere else to look rather than
 * silently giving up. Ranked so the fallback always changes *modality*
 * first (drilling -> playing, listening -> talking, talking ->
 * teaching-back) before considering a same-modality alternative.
 * `regulation` is deliberately never a candidate — it's presented as its
 * own full screen (app/kid/regulation.tsx), never as a node block.
 */
export const METHOD_FALLBACK: Record<TeachingMethod, TeachingMethod[]> = {
  question: ['game_3d', 'story_mission', 'chat_tutor'],
  video: ['chat_tutor', 'game_3d', 'question'],
  game_3d: ['chat_tutor', 'question'],
  chat_tutor: ['reverse_tutor', 'game_3d', 'question'],
  trace: ['game_3d', 'chat_tutor', 'question'],
  speak_practice: ['chat_tutor', 'game_3d', 'question'],
  reverse_tutor: ['question', 'chat_tutor'],
  story_mission: ['question', 'game_3d'],
  regulation: ['question'],
};

/**
 * Walks `currentMethod`'s ranked fallback list and returns the first
 * candidate the node actually has a block for. Doing this lookup at
 * queue time (instead of discovering the mismatch later, when the node
 * player tries to apply the switch) is what guarantees a queued switch
 * is always applicable — see `evaluateAdaptiveSwitch`.
 */
export function pickAvailableFallback(currentMethod: TeachingMethod, availableMethods: readonly TeachingMethod[]): TeachingMethod | undefined {
  const available = new Set(availableMethods);
  return METHOD_FALLBACK[currentMethod].find((candidate) => candidate !== currentMethod && available.has(candidate));
}
