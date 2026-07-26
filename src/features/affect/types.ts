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
