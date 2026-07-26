import type { FaceFeatures } from '@modules/distraction-vision/src';
import type { AffectLabel } from './types';

/**
 * Turns MediaPipe's raw face geometry/expression output into one of our
 * five affect labels. This is a first-pass, hand-tuned heuristic — not a
 * trained or validated "frustration classifier" — built on real signal
 * (actual head pose + actual facial-expression blendshapes) rather than
 * `Math.random()`. Expect the thresholds below to need adjustment after
 * watching how real sessions actually score; they were chosen for
 * plausibility, not calibrated against recorded kid sessions.
 */

export interface ClassifiedAffect {
  label: AffectLabel;
  confidence: number;
  /**
   * The intermediate numbers this verdict was actually derived from, so
   * the audit log can show *why* a tick read as distracted/frustrated
   * rather than only the verdict — which is what makes the thresholds
   * above tunable against real sessions instead of guesswork.
   */
  diagnostics: ClassifierDiagnostics;
}

export interface ClassifierDiagnostics {
  /** Absent when no face was in frame, or when the native side sent no transformation matrix. */
  headOffAxisDeg?: number;
  /** Weighted brow/mouth/nose score compared against FRUSTRATION_THRESHOLD. Absent when no face was in frame. */
  frustrationScore?: number;
  /** Averaged smile score compared against ENGAGED_SMILE_THRESHOLD. Absent when no face was in frame. */
  smileScore?: number;
}

/** Degrees off-axis before we call it "looking away from the screen". */
const OFF_AXIS_DISTRACTED_DEG = 28;
/** Degrees off-axis at which distraction confidence saturates. */
const OFF_AXIS_SATURATED_DEG = 55;
/** No face in frame at all is a strong distraction signal, but not certain — could be a momentary head duck or bad framing. */
const NO_FACE_CONFIDENCE = 0.75;

/** Combined brow/mouth/nose blendshape score above which we call it frustration or distaste. */
const FRUSTRATION_THRESHOLD = 0.45;
const FRUSTRATION_SATURATED = 0.85;

/** Smile blendshape score above which we call it engaged rather than neutral. */
const ENGAGED_SMILE_THRESHOLD = 0.4;

/** Exported so the audit-log UI can render each reading against the same bar the classifier used. */
export const CLASSIFIER_THRESHOLDS = {
  offAxisDistractedDeg: OFF_AXIS_DISTRACTED_DEG,
  frustration: FRUSTRATION_THRESHOLD,
  engagedSmile: ENGAGED_SMILE_THRESHOLD,
} as const;

function average(...values: (number | undefined)[]): number {
  const present = values.filter((v): v is number => v !== undefined);
  if (present.length === 0) return 0;
  return present.reduce((sum, v) => sum + v, 0) / present.length;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Scales a value past `threshold` (up to `saturatesAt`) into a 0.6-0.9 confidence band. */
function confidenceAbove(value: number, threshold: number, saturatesAt: number): number {
  const t = clamp01((value - threshold) / (saturatesAt - threshold));
  return 0.6 + t * 0.3;
}

export function classifyFaceFeatures(features: FaceFeatures): ClassifiedAffect {
  if (!features.faceDetected) {
    // Camera can't see a face at all — the kid most likely isn't looking
    // at the screen. Deliberately not saturated: could just be bad
    // framing or a momentary look-down, not necessarily distraction.
    return { label: 'distracted', confidence: NO_FACE_CONFIDENCE, diagnostics: {} };
  }

  const shapes = features.blendshapes ?? {};
  const browDown = average(shapes.browDownLeft, shapes.browDownRight);
  const mouthPress = average(shapes.mouthPressLeft, shapes.mouthPressRight);
  const noseSneer = average(shapes.noseSneerLeft, shapes.noseSneerRight);
  const mouthFrown = average(shapes.mouthFrownLeft, shapes.mouthFrownRight);
  const mouthSmile = average(shapes.mouthSmileLeft, shapes.mouthSmileRight);
  const frustrationScore = browDown * 0.4 + mouthPress * 0.25 + noseSneer * 0.2 + mouthFrown * 0.15;

  // Every branch below reports the same full diagnostic set, so the audit
  // log can show the near-misses too ("frustration 0.42 vs 0.45 bar"),
  // not just whichever number happened to win.
  const diagnostics: ClassifierDiagnostics = {
    headOffAxisDeg: features.headOffAxisDeg,
    frustrationScore,
    smileScore: mouthSmile,
  };

  if (features.headOffAxisDeg !== undefined && features.headOffAxisDeg >= OFF_AXIS_DISTRACTED_DEG) {
    return {
      label: 'distracted',
      confidence: confidenceAbove(features.headOffAxisDeg, OFF_AXIS_DISTRACTED_DEG, OFF_AXIS_SATURATED_DEG),
      diagnostics,
    };
  }

  if (frustrationScore >= FRUSTRATION_THRESHOLD) {
    // Sneer-dominant reads closer to disgust/distaste; brow+mouth-press
    // dominant reads closer to frustration. Rough split, not a real
    // distinction MediaPipe draws for us.
    const label: AffectLabel = noseSneer > browDown + mouthPress ? 'distaste' : 'frustrated';
    return { label, confidence: confidenceAbove(frustrationScore, FRUSTRATION_THRESHOLD, FRUSTRATION_SATURATED), diagnostics };
  }

  if (mouthSmile >= ENGAGED_SMILE_THRESHOLD) {
    return { label: 'engaged', confidence: confidenceAbove(mouthSmile, ENGAGED_SMILE_THRESHOLD, 1), diagnostics };
  }

  return { label: 'neutral', confidence: 0.5, diagnostics };
}
