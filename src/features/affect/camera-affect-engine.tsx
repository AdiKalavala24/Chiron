import React, { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { classifyFace } from '@modules/distraction-vision/src';
import { classifyFaceFeatures } from './face-classifier';
import type { AffectLabel, AffectSignal } from './types';

const SIGNAL_INTERVAL_MS = 5000;
/** Low — this is a snapshot for ML classification, not something a human ever looks at. */
const SNAPSHOT_QUALITY = 0.3;

/** Lets a dev panel or test harness fire a specific signal on demand instead of waiting on the real camera loop. */
export function simulateAffectSignal(label: AffectLabel, confidence = 0.85): AffectSignal {
  return { at: Date.now(), label, confidence };
}

interface UseCameraAffectEngineOptions {
  /** Gate this on "camera step visible AND parent enabled affect sensing" — the loop only runs while true. */
  active: boolean;
  onSignal: (signal: AffectSignal) => void;
}

export function useCameraAffectEngine({ active, onSignal }: UseCameraAffectEngineOptions) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const cameraReadyRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(true);
  const onSignalRef = useRef(onSignal);

  useEffect(() => {
    onSignalRef.current = onSignal;
  }, [onSignal]);

  const granted = permission?.granted ?? false;

  useEffect(() => {
    if (!active || !granted) {
      cancelledRef.current = true;
      cameraReadyRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    cancelledRef.current = false;

    // Recursive setTimeout rather than setInterval: a tick does an async
    // camera capture + native classification, and we never want two ticks
    // overlapping if one runs long — the next tick is only scheduled once
    // the current one has fully finished (success or failure).
    const tick = async () => {
      try {
        if (!cameraReadyRef.current || !cameraRef.current) return;
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: SNAPSHOT_QUALITY });
        if (cancelledRef.current || !photo?.base64) return;

        const features = await classifyFace(photo.base64);
        if (cancelledRef.current || !features) return;

        const { label, confidence } = classifyFaceFeatures(features);
        onSignalRef.current({ at: Date.now(), label, confidence });
      } catch (error) {
        // Capture or classification failed this tick (camera not settled,
        // transient decode error, etc.) — skip it and try again next tick
        // rather than surfacing a false reading.
        console.warn('[affect] camera snapshot classification failed', error);
      } finally {
        if (!cancelledRef.current) {
          timeoutRef.current = setTimeout(tick, SIGNAL_INTERVAL_MS);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, SIGNAL_INTERVAL_MS);

    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [active, granted]);

  return {
    /** Pass to `AffectCameraPreview`'s `ref` prop so the engine can snapshot the same feed the kid sees the indicator for. */
    cameraRef,
    /** Pass to `AffectCameraPreview`'s `onCameraReady` prop — snapshots before this fires can throw. */
    onCameraReady: () => {
      cameraReadyRef.current = true;
    },
    permissionGranted: granted,
    permissionCanAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
  };
}

interface AffectCameraPreviewProps {
  style?: StyleProp<ViewStyle>;
  onCameraReady?: () => void;
}

/**
 * Tiny, unobtrusive front-camera preview. Mount this while the engine is
 * active so the permission indicator stays honest about the camera being
 * in use — the kid should always be able to see when sensing is live.
 * Forwards its ref to the underlying `CameraView` so `useCameraAffectEngine`
 * can call `takePictureAsync` on the exact feed being previewed.
 */
export const AffectCameraPreview = React.forwardRef<CameraView, AffectCameraPreviewProps>(function AffectCameraPreview(
  { style, onCameraReady },
  ref,
) {
  return <CameraView ref={ref} style={style} facing="front" animateShutter={false} onCameraReady={onCameraReady} />;
});
