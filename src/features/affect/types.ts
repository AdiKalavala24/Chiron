import type { ClassifierDiagnostics } from './face-classifier';

export type AffectLabel = 'neutral' | 'engaged' | 'frustrated' | 'distaste' | 'distracted';

export interface AffectSignal {
  at: number;
  label: AffectLabel;
  /** 0-1. The adaptive controller only acts above ~0.6. */
  confidence: number;
}

export interface AffectSignalSource {
  start(onSignal: (signal: AffectSignal) => void): void;
  stop(): void;
}

/**
 * Why a single camera tick produced — or failed to produce — a reading.
 * Anything other than `classified`/`no_face` means the sensing pipeline
 * didn't run end to end, which is the distinction that makes an empty
 * audit log interpretable: no entries at all means sensing never ran,
 * whereas a wall of `classifier_unavailable` means it ran and couldn't
 * reach the model.
 */
export type AffectReadingOutcome =
  | 'classified'
  | 'no_face'
  /** Snapshotting the camera threw, or the preview wasn't ready yet. */
  | 'capture_failed'
  /** The native MediaPipe module wasn't reachable — usually a dev client that predates the module and needs rebuilding. */
  | 'classifier_unavailable';

/**
 * Emitted once per camera tick regardless of outcome. `AffectSignal` is
 * the narrow "we got a verdict" path that feeds the adaptive controller;
 * this is the full picture that feeds the audit log.
 */
export interface AffectReading {
  at: number;
  outcome: AffectReadingOutcome;
  label?: AffectLabel;
  confidence?: number;
  diagnostics?: ClassifierDiagnostics;
  /** Error text on the failure outcomes. */
  detail?: string;
}
