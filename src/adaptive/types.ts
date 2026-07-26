/**
 * The adaptive engine reasons about a child's moment-to-moment state purely
 * from behavioral signals (answer correctness + response timing) — no
 * camera, wearable, or eye-tracking input required for this v1. That keeps
 * it honest with what's actually implemented, while leaving the door open
 * for a biometric/vision signal to plug into the same `InteractionEvent`
 * shape later (see `@/services/vision.ts`).
 */
export type InteractionEvent = {
  timestamp: number;
  correct: boolean;
  responseTimeMs: number;
  /** Human-readable label for the question this event belongs to, used to write the parent debrief. */
  questionLabel?: string;
};

/**
 * - `engaged`     steady, productive default state.
 * - `frustrated`  rapid wrong guesses — likely guessing out of frustration, not thinking it through.
 * - `bored`       slow, checked-out responses with no wrong-answer stress — attention has drifted.
 * - `celebrating` a genuine winning streak — the moment to be loud and proud, not neutral.
 */
export type EngagementState = 'engaged' | 'frustrated' | 'bored' | 'celebrating';
