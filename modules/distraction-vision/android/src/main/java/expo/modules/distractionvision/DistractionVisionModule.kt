package expo.modules.distractionvision

import android.graphics.BitmapFactory
import android.util.Base64
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import kotlin.math.acos

/**
 * NOTE: written and reviewed for correctness against the real MediaPipe
 * Tasks Vision Android AAR (0.10.35) API surface, but — unlike the iOS
 * counterpart in ../ios/DistractionVisionModule.swift — never actually
 * compiled or run, because this environment has no Android SDK/Gradle to
 * build against. Treat this as a strong first draft: expect it to need a
 * real Android build to shake out anything that doesn't survive contact
 * with Gradle/AGP. Keep in sync with the iOS implementation.
 */
private val relevantBlendshapeNames = setOf(
  "browDownLeft", "browDownRight",
  "mouthFrownLeft", "mouthFrownRight",
  "mouthPressLeft", "mouthPressRight",
  "noseSneerLeft", "noseSneerRight",
  "mouthSmileLeft", "mouthSmileRight",
  "eyeBlinkLeft", "eyeBlinkRight",
  "jawOpen",
)

@OptimizedRecord
data class FaceFeaturesRecord(
  @Field val faceDetected: Boolean,
  @Field val headOffAxisDeg: Double?,
  @Field val blendshapes: Map<String, Double>?,
) : Record

class DistractionVisionException(message: String) : CodedException(message)

class DistractionVisionModule : Module() {
  // Created lazily on first use (loading the ~3.7MB model is the
  // expensive part) and reused across calls — re-creating a FaceLandmarker
  // per frame would reload the model every ~5s tick for no reason.
  private val faceLandmarker: FaceLandmarker? by lazy {
    val context = appContext.reactContext ?: return@lazy null
    try {
      val baseOptions = BaseOptions.builder()
        // MediaPipe resolves plain relative paths against the app's
        // Android assets/ folder, where face_landmarker.task is bundled
        // (android/src/main/assets/face_landmarker.task).
        .setModelAssetPath("face_landmarker.task")
        .build()
      val options = FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.IMAGE)
        .setNumFaces(1)
        .setOutputFaceBlendshapes(true)
        .setOutputFacialTransformationMatrixes(true)
        .build()
      FaceLandmarker.createFromOptions(context, options)
    } catch (error: Exception) {
      null
    }
  }

  override fun definition() = ModuleDefinition {
    Name("DistractionVision")

    AsyncFunction("classifyFace") { base64Jpeg: String ->
      val landmarker = faceLandmarker
        ?: throw DistractionVisionException(
          "FaceLandmarker failed to initialize — face_landmarker.task may be missing from the app's assets.",
        )

      val bytes = try {
        Base64.decode(base64Jpeg, Base64.DEFAULT)
      } catch (error: Exception) {
        throw DistractionVisionException("Could not decode the provided frame as base64.")
      }
      val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        ?: throw DistractionVisionException("Could not decode the provided frame as a JPEG image.")

      val result = try {
        landmarker.detect(BitmapImageBuilder(bitmap).build())
      } catch (error: Exception) {
        throw DistractionVisionException("MediaPipe face detection failed: ${error.message}")
      }

      if (result.faceLandmarks().isEmpty()) {
        return@AsyncFunction FaceFeaturesRecord(faceDetected = false, headOffAxisDeg = null, blendshapes = null)
      }

      // facialTransformationMatrixes() gives a flattened 4x4 per face. The
      // (2,2) diagonal entry is cos(angle between the face's local forward
      // axis and the camera's optical axis) — true regardless of whether
      // the turn reads as yaw, pitch, or a mix of both, and regardless of
      // row- vs column-major flattening (a diagonal index is the same
      // either way: 2*4+2 = 10). See the iOS implementation for the fuller
      // rationale.
      val headOffAxisDeg = result.facialTransformationMatrixes().orElse(null)
        ?.firstOrNull()
        ?.takeIf { it.size >= 16 }
        ?.let { matrix ->
          val cosOffAxis = matrix[10].toDouble().coerceIn(-1.0, 1.0)
          Math.toDegrees(acos(cosOffAxis))
        }

      val blendshapes = result.faceBlendshapes().orElse(null)
        ?.firstOrNull()
        ?.filter { it.categoryName() in relevantBlendshapeNames }
        ?.associate { it.categoryName() to it.score().toDouble() }

      FaceFeaturesRecord(faceDetected = true, headOffAxisDeg = headOffAxisDeg, blendshapes = blendshapes)
    }
  }
}
