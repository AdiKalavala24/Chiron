import { NativeModule, requireNativeModule } from 'expo';
import type { FaceFeatures } from './DistractionVision.types';

declare class DistractionVisionModule extends NativeModule<{}> {
  /**
   * Runs MediaPipe Face Landmarker on a single JPEG frame (base64, no
   * data: URI prefix). Resolves even when no face is found — check
   * `faceDetected` on the result rather than expecting a rejection.
   */
  classifyFace(base64Jpeg: string): Promise<FaceFeatures>;
}

export default requireNativeModule<DistractionVisionModule>('DistractionVision');
