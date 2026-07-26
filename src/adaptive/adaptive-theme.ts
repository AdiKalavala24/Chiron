import type { ThemeColor } from '@/constants/theme';
import type { EngagementState } from '@/adaptive/types';

export type AdaptiveAdjustment = {
  /** Which confetti color the lesson screen should lean into right now. */
  accentColor: ThemeColor;
  /** Short label shown in the UI so the adaptivity is visible, not just felt. */
  label: string;
  /** What the tutor persona says when it notices this state. */
  tutorMessage: string;
  /** What the app does about it — the actual "counselor's instinct" intervention. */
  intervention: string;
  /** Dial for how much bounce/confetti to show; also gets clamped by reduced-motion. */
  motionScale: number;
};

const ADJUSTMENTS: Record<EngagementState, AdaptiveAdjustment> = {
  engaged: {
    accentColor: 'accent',
    label: 'In the flow',
    tutorMessage: "You're on a roll — let's keep going at this pace.",
    intervention: 'Stay the course: same difficulty, same pacing.',
    motionScale: 0.6,
  },
  frustrated: {
    accentColor: 'quaternary',
    label: 'Noticed some frustration',
    tutorMessage: "Let's slow down for a second — want to try an easier one, just to reset?",
    intervention: 'Backed off to an easier question and softened the tone, the way a counselor would reframe rather than push through.',
    motionScale: 0.15,
  },
  bored: {
    accentColor: 'tertiary',
    label: 'Attention drifting',
    tutorMessage: 'Okay, plot twist — bet you can\'t solve this one before I count to five!',
    intervention: 'Switched to a faster, more gamified question to re-hook attention.',
    motionScale: 1,
  },
  celebrating: {
    accentColor: 'secondary',
    label: 'On a streak!',
    tutorMessage: "Two in a row! You're basically a math wizard right now.",
    intervention: 'Threw a confetti burst and bumped the difficulty up a notch while spirits are high.',
    motionScale: 1,
  },
};

export function getAdaptiveAdjustment(state: EngagementState): AdaptiveAdjustment {
  return ADJUSTMENTS[state];
}
