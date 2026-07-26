import { registerWebModule, NativeModule } from 'expo';
import type { FaceFeatures } from './DistractionVision.types';

// No web build of MediaPipe Tasks Vision is wired up here — the camera
// affect engine only calls this on native, but keep the shape honest
// rather than silently resolving something meaningless.
class DistractionVisionModule extends NativeModule<{}> {
  async classifyFace(_base64Jpeg: string): Promise<FaceFeatures> {
    throw new Error('DistractionVision.classifyFace is not implemented on web.');
  }
}

export default registerWebModule(DistractionVisionModule, 'DistractionVisionModule');
