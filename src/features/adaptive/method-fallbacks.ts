import type { TeachingMethod } from '@/features/curriculum';

/**
 * Where the Adaptive Controller sends a struggling kid next, per current
 * method. Chosen so the fallback always changes *modality* (drilling ->
 * playing, listening -> talking, talking -> teaching-back) rather than
 * just reshuffling the same kind of task.
 */
export const METHOD_FALLBACK: Record<TeachingMethod, TeachingMethod> = {
  question: 'game_3d',
  video: 'chat_tutor',
  game_3d: 'chat_tutor',
  chat_tutor: 'reverse_tutor',
  trace: 'game_3d',
  speak_practice: 'chat_tutor',
  reverse_tutor: 'question',
  story_mission: 'question',
  regulation: 'question',
};
