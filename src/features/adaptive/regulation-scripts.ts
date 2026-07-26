import type { RegulationPayload } from '@/features/curriculum';

/**
 * Regulation is triggered by the Adaptive Controller, not authored into
 * any node — so unlike every other method, its content lives here
 * rather than in content/paths/. Picked at random for variety each time
 * a regulation beat fires.
 */
export const REGULATION_SCRIPTS: RegulationPayload[] = [
  {
    activity: 'breathing',
    durationSeconds: 18,
    script: [
      "Let's take a breath together.",
      'Breathe in slowly... 1... 2... 3...',
      'And breathe out... 1... 2... 3...',
      'One more time, nice and slow.',
      "Great job — you're ready to keep going.",
    ],
  },
  {
    activity: 'movement',
    durationSeconds: 15,
    script: [
      'Time for a quick wiggle break!',
      'Stretch your arms up high.',
      'Give yourself a little shake.',
      'Roll your shoulders back.',
      "Nice! Let's get back to it.",
    ],
  },
  {
    activity: 'silly_simon',
    durationSeconds: 15,
    script: [
      'Quick silly break!',
      'Touch your nose with one finger.',
      'Now wiggle your ears (or pretend to!).',
      'Give a big goofy smile.',
      "Awesome — you're all reset.",
    ],
  },
];

export function pickRegulationScript(): RegulationPayload {
  return REGULATION_SCRIPTS[Math.floor(Math.random() * REGULATION_SCRIPTS.length)];
}
