import DistractionVisionModule from './DistractionVisionModule';
import type { FaceFeatures } from './DistractionVision.types';

export type { FaceFeatures };

let warnedUnavailable = false;

/**
 * Safe wrapper around the native MediaPipe Face Landmarker call: resolves
 * to `null` (instead of throwing) whenever the native module isn't linked
 * — e.g. the dev client hasn't been rebuilt since this module was added,
 * or on a platform without an implementation. Callers must treat `null`
 * as "no reading this tick", not as "no face" — `{ faceDetected: false }`
 * means the model ran fine and simply found nobody in frame.
 */
export async function classifyFace(base64Jpeg: string): Promise<FaceFeatures | null> {
  try {
    return await DistractionVisionModule.classifyFace(base64Jpeg);
  } catch (error) {
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      console.warn(
        '[distraction-vision] classifyFace unavailable — has the dev client been rebuilt since this module was added?',
        error,
      );
    }
    return null;
  }
}
