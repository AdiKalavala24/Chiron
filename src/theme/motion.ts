/**
 * Motion presets — "bouncy overshoot" is the house feel for Chiron.
 * Every entrance pops, every press wiggles. Reduced-motion users get
 * instant, non-bouncy transitions instead of the same animations sped up.
 */
import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

/** cubic-bezier(0.34, 1.56, 0.64, 1) — overshoots past 100% then settles. */
export const overshootEasing = Easing.bezier(0.34, 1.56, 0.64, 1);

export const springs = {
  bouncy: { damping: 12, stiffness: 180, mass: 0.9 } satisfies WithSpringConfig,
  press: { damping: 18, stiffness: 260, mass: 0.7 } satisfies WithSpringConfig,
  gentle: { damping: 16, stiffness: 120, mass: 1 } satisfies WithSpringConfig,
} as const;

export const durations = {
  fast: 120,
  base: 220,
  slow: 360,
  entrance: 480,
} as const;

export const timing = {
  entrancePop: { duration: durations.entrance, easing: overshootEasing } satisfies WithTimingConfig,
  base: { duration: durations.base, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
  fast: { duration: durations.fast, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
};

/** Press scale/shadow interaction values shared by CandyButton, StickerCard, etc. */
export const pressScale = {
  rest: 1,
  pressed: 0.96,
} as const;

/** Small rotation used for icon "wiggle" on hover/press, in degrees. */
export const wiggleDegrees = 8;
