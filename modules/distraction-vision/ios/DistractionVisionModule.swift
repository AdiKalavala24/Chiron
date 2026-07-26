import ExpoModulesCore
import MediaPipeTasksVision
import UIKit

/**
 * Blendshape categories the TS-side heuristic (src/features/affect/face-classifier.ts)
 * actually reads. MediaPipe's Face Landmarker emits 52 ARKit-compatible
 * categories per frame; only forwarding this subset keeps the JSI bridge
 * payload small without losing anything the classifier uses.
 */
private let relevantBlendshapeNames: Set<String> = [
  "browDownLeft", "browDownRight",
  "mouthFrownLeft", "mouthFrownRight",
  "mouthPressLeft", "mouthPressRight",
  "noseSneerLeft", "noseSneerRight",
  "mouthSmileLeft", "mouthSmileRight",
  "eyeBlinkLeft", "eyeBlinkRight",
  "jawOpen",
]

struct FaceFeaturesRecord: Record {
  @Field var faceDetected: Bool = false
  @Field var headOffAxisDeg: Double? = nil
  @Field var blendshapes: [String: Double]? = nil
}

final class DistractionVisionException: Exception, @unchecked Sendable {
  private let message: String
  init(_ message: String) {
    self.message = message
    super.init()
  }
  override var reason: String { message }
}

public class DistractionVisionModule: Module {
  // Created lazily on first use (loading the model is the expensive part)
  // and reused across calls — re-creating a FaceLandmarker per frame would
  // reload the ~3.7MB model every ~5s tick for no reason.
  private lazy var faceLandmarker: FaceLandmarker? = {
    guard let modelPath = Bundle(for: DistractionVisionModule.self).path(forResource: "face_landmarker", ofType: "task") else {
      return nil
    }
    let options = FaceLandmarkerOptions()
    options.baseOptions.modelAssetPath = modelPath
    options.runningMode = .image
    options.numFaces = 1
    options.outputFaceBlendshapes = true
    options.outputFacialTransformationMatrixes = true
    return try? FaceLandmarker(options: options)
  }()

  public func definition() -> ModuleDefinition {
    Name("DistractionVision")

    AsyncFunction("classifyFace") { (base64Jpeg: String) -> FaceFeaturesRecord in
      guard let landmarker = self.faceLandmarker else {
        throw DistractionVisionException("FaceLandmarker failed to initialize — face_landmarker.task may be missing from the app bundle.")
      }
      guard let data = Data(base64Encoded: base64Jpeg), let uiImage = UIImage(data: data) else {
        throw DistractionVisionException("Could not decode the provided frame as a JPEG image.")
      }
      let mpImage: MPImage
      do {
        mpImage = try MPImage(uiImage: uiImage)
      } catch {
        throw DistractionVisionException("Could not wrap the decoded image for MediaPipe: \(error.localizedDescription)")
      }

      let result: FaceLandmarkerResult
      do {
        result = try landmarker.detect(image: mpImage)
      } catch {
        throw DistractionVisionException("MediaPipe face detection failed: \(error.localizedDescription)")
      }

      guard !result.faceLandmarks.isEmpty else {
        return FaceFeaturesRecord(faceDetected: false, headOffAxisDeg: nil, blendshapes: nil)
      }

      let record = FaceFeaturesRecord()
      record.faceDetected = true

      if let matrix = result.facialTransformationMatrixes.first {
        // The (2,2) entry of a pure rotation matrix is cos(angle between
        // the face's local forward axis and the camera's optical axis) —
        // true regardless of whether the turn reads as yaw, pitch, or a
        // mix of both, which is exactly "is the face pointed at the
        // screen" without having to commit to (and risk getting backwards
        // without a live face to test against) a specific Euler axis
        // convention for this matrix.
        let cosOffAxis = Double(matrix.value(atRow: 2, column: 2))
        record.headOffAxisDeg = acos(min(1, max(-1, cosOffAxis))) * 180.0 / Double.pi
      }

      if let classifications = result.faceBlendshapes.first {
        var shapes: [String: Double] = [:]
        for category in classifications.categories where relevantBlendshapeNames.contains(category.categoryName ?? "") {
          shapes[category.categoryName!] = Double(category.score)
        }
        record.blendshapes = shapes
      }

      return record
    }
  }
}
