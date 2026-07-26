import type { SubjectPath } from '@/features/curriculum/types';
import { kMath } from './k-math';
import { g1Math } from './g1-math';
import { g2Math } from './g2-math';
import { g3Math } from './g3-math';
import { g4Math } from './g4-math';
import { kReading } from './k-reading';
import { g1Reading } from './g1-reading';
import { g2Reading } from './g2-reading';
import { g3Reading } from './g3-reading';
import { g4Reading } from './g4-reading';
import { kWriting } from './k-writing';
import { g1Writing } from './g1-writing';
import { g2Writing } from './g2-writing';
import { g3Writing } from './g3-writing';
import { g4Writing } from './g4-writing';
import { kSpeaking } from './k-speaking';
import { g1Speaking } from './g1-speaking';
import { g2Speaking } from './g2-speaking';
import { g3Speaking } from './g3-speaking';
import { g4Speaking } from './g4-speaking';

/**
 * Every hardcoded grade × subject path, 5 grade bands × 4 subjects = 20.
 * k-math, g2-reading, g1-writing, and g3-speaking are the "flagship"
 * paths authored with the full method variety (video, chat_tutor, trace,
 * speak_practice, reverse_tutor, story_mission, game_3d); the rest ship
 * a coherent node progression backed by real question/trace/speak
 * content so nothing in the grid is empty.
 */
export const ALL_PATHS: SubjectPath[] = [
  kMath,
  g1Math,
  g2Math,
  g3Math,
  g4Math,
  kReading,
  g1Reading,
  g2Reading,
  g3Reading,
  g4Reading,
  kWriting,
  g1Writing,
  g2Writing,
  g3Writing,
  g4Writing,
  kSpeaking,
  g1Speaking,
  g2Speaking,
  g3Speaking,
  g4Speaking,
];
