/**
 * Client-facing contract for the computer-vision signal (the "Tangible /
 * Computer Vision Desk Tutor" concept — a phone pointed at a desk, watching
 * physical objects like blocks or flashcards). Not wired to a real model
 * yet: YOLO inference for this needs an infra decision this stub
 * deliberately leaves open rather than making unilaterally —
 *
 *  - On-device (e.g. `react-native-fast-tflite` / `onnxruntime-react-native`
 *    running a YOLO export): zero network latency and works offline, but
 *    constrains model size and needs per-platform benchmarking on real
 *    devices before committing.
 *  - Server-side (upload frames, run YOLO on a GPU box): simpler model
 *    ops and easy upgrades, but adds latency and a per-frame bandwidth/
 *    privacy cost for a product pointed at a child's desk.
 *
 * Both implementations would satisfy the same `VisionClient` interface, so
 * the screens never need to know which one is running.
 */
export type DetectedObject = {
  label: string;
  confidence: number;
  /** [x, y, width, height] as fractions of frame size, 0–1. */
  bbox: [number, number, number, number];
};

export interface VisionClient {
  detectObjects(frameUri: string): Promise<DetectedObject[]>;
}

/** Mock implementation — returns a fixed, plausible detection so UI built against this can be demoed today. */
export function createMockVisionClient(): VisionClient {
  return {
    async detectObjects(_frameUri) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return [
        { label: 'block-blue', confidence: 0.93, bbox: [0.2, 0.3, 0.15, 0.15] },
        { label: 'block-blue', confidence: 0.91, bbox: [0.38, 0.3, 0.15, 0.15] },
        { label: 'block-red', confidence: 0.88, bbox: [0.56, 0.3, 0.15, 0.15] },
      ];
    },
  };
}
