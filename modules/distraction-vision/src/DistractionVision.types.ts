/**
 * Raw geometric/expression features for the single largest face in a
 * frame, straight off MediaPipe's Face Landmarker (no affect judgment
 * applied yet — see `src/features/affect/face-classifier.ts` for the
 * "is this kid distracted/frustrated" heuristic built on top).
 */
export interface FaceFeatures {
  /** False when no face was found in the frame at all. Every other field is then absent. */
  faceDetected: boolean;
  /**
   * Degrees between the face's forward-facing direction and the camera's
   * optical axis — 0 means looking straight at the camera/screen, higher
   * means turned or tilted away (whether that's technically a yaw or
   * pitch rotation). Deliberately a single undirected angle rather than
   * separate yaw/pitch/roll — see the native implementation for why.
   */
  headOffAxisDeg?: number;
  /**
   * A subset of MediaPipe's 52 ARKit-compatible blendshape scores (0-1),
   * keyed by category name (e.g. "browDownLeft", "mouthPressLeft"). Only
   * the categories the classifier heuristic actually reads are included —
   * see RELEVANT_BLENDSHAPES in the native implementation.
   */
  blendshapes?: Record<string, number>;
}
