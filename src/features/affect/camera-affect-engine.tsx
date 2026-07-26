import React, { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { AffectLabel, AffectSignal } from './types';

const SIGNAL_INTERVAL_MS = 5000;

/**
 * PLACEHOLDER CLASSIFIER — read before wiring this into anything real.
 *
 * Real frustration/distaste facial-expression classification needs a
 * trained on-device model (facial action units) or a third-party SDK
 * (e.g. Affectiva) — that's a data/ML investment this pass can't ship.
 * This function exists so the *deferred-switch* mechanism (queue a
 * method change on signal, apply it only after the current item ends)
 * has a real signal stream to react to end-to-end during development.
 *
 * Everything downstream of this file only depends on the `AffectSignal`
 * shape, so swapping this for a real classifier later is a one-file
 * change — nothing in the adaptive controller or UI needs to move.
 */
function placeholderClassify(): AffectSignal {
  const roll = Math.random();
  let label: AffectLabel = 'neutral';
  let confidence = 0.5;
  if (roll < 0.08) {
    label = 'frustrated';
    confidence = 0.7 + Math.random() * 0.25;
  } else if (roll < 0.13) {
    label = 'distaste';
    confidence = 0.65 + Math.random() * 0.25;
  } else if (roll < 0.22) {
    label = 'distracted';
    confidence = 0.6 + Math.random() * 0.25;
  } else if (roll < 0.5) {
    label = 'engaged';
    confidence = 0.6 + Math.random() * 0.3;
  }
  return { at: Date.now(), label, confidence };
}

/** Lets a dev panel or test harness fire a specific signal on demand instead of waiting on the random timer. */
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSignalRef = useRef(onSignal);

  useEffect(() => {
    onSignalRef.current = onSignal;
  }, [onSignal]);

  const granted = permission?.granted ?? false;

  useEffect(() => {
    if (!active || !granted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      onSignalRef.current(placeholderClassify());
    }, SIGNAL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [active, granted]);

  return {
    permissionGranted: granted,
    permissionCanAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
  };
}

/**
 * Tiny, unobtrusive front-camera preview. Mount this while the engine is
 * active so the permission indicator stays honest about the camera being
 * in use — the kid should always be able to see when sensing is live.
 */
export function AffectCameraPreview({ style }: { style?: StyleProp<ViewStyle> }) {
  return <CameraView style={style} facing="front" animateShutter={false} />;
}
