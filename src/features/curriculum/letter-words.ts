/**
 * One canonical keyword per letter. Two very different features depend on
 * the same mapping, so it lives here rather than in either of them:
 * Magic Canvas Tracing pops the traced letter into this object in 3D, and
 * the technique ensemble builds real "which word starts with B?" phonics
 * items out of it when a node has no question content of its own.
 *
 * Keys are uppercase; look words up through `wordForLetter`.
 */
export const LETTER_WORDS: Record<string, string> = {
  A: 'Apple',
  B: 'Butterfly',
  C: 'Cloud',
  D: 'Drum',
  E: 'Egg',
  F: 'Fish',
  G: 'Gift',
  H: 'House',
  I: 'Ice cream',
  J: 'Jet',
  K: 'Kite',
  L: 'Leaf',
  M: 'Moon',
  N: 'Nest',
  O: 'Orange',
  P: 'Planet',
  Q: 'Quilt',
  R: 'Rocket',
  S: 'Star',
  T: 'Tree',
  U: 'Umbrella',
  V: 'Van',
  W: 'Whale',
  X: 'Xylophone',
  Y: 'Yo-yo',
  Z: 'Zeppelin',
};

export const LETTERS = Object.keys(LETTER_WORDS);

export function wordForLetter(letter: string): string {
  return LETTER_WORDS[letter.trim().charAt(0).toUpperCase()] ?? 'Star';
}
