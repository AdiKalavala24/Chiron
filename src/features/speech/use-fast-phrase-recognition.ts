import { useCallback, useEffect, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { textSimilarity } from '@/lib/random';

/**
 * How long the transcript has to stop changing before we grade what we
 * have. The platform recognizer's own end-of-speech detection is far
 * slower than this (iOS routinely sits ~1.5-2s past the last word before
 * emitting `isFinal`), and for a kid reading a four-word phrase that dead
 * air reads as "the app is broken". Interim results let us decide
 * ourselves.
 */
const SETTLE_MS = 600;
/** Absolute ceiling on one attempt, so a stuck recognizer can't hang the round. */
const MAX_LISTEN_MS = 8000;
/** Volume sampling cadence — fast enough for a responsive level ring, slow enough to stay cheap. */
const VOLUME_INTERVAL_MS = 100;

export interface PhraseAttempt {
  transcript: string;
  /** 0-1 similarity against the target phrase. */
  score: number;
  /** True when we graded off a settled interim result rather than the recognizer's own final result. */
  early: boolean;
}

interface UseFastPhraseRecognitionArgs {
  /** Score at or above which an interim transcript is good enough to accept immediately. */
  passAccuracy: number;
  onAttempt: (attempt: PhraseAttempt) => void;
}

export interface FastPhraseRecognition {
  /** Mic permission granted *and* a recognizer is actually available on this device. */
  available: boolean;
  listening: boolean;
  /** Live transcript as it's being recognized — render this to show the kid they're being heard. */
  partial: string;
  /** 0-1 normalized input level, for a mic meter. */
  level: number;
  start: (target: string) => void;
  stop: () => void;
}

/**
 * Low-latency wrapper around expo-speech-recognition for the "read this
 * short phrase out loud" interaction.
 *
 * Three things make it feel immediate where the plain final-result flow
 * did not:
 *  1. **Interim results** stream a live transcript, so there's visible
 *     feedback while the kid is still talking.
 *  2. **Early accept** — the moment an interim transcript already scores
 *     a pass, grade it and stop. A correct reading resolves the instant
 *     the last word lands.
 *  3. **Settle timer** — if the transcript stops changing for
 *     `SETTLE_MS`, grade whatever we heard instead of waiting on the
 *     platform's much later end-of-speech callback.
 *
 * Scoring stays exactly what it was: Levenshtein similarity against the
 * target, an honest fluency/accuracy proxy rather than a true
 * phoneme-level pronunciation grade.
 */
export function useFastPhraseRecognition({ passAccuracy, onAttempt }: UseFastPhraseRecognitionArgs): FastPhraseRecognition {
  const [available, setAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [level, setLevel] = useState(0);

  const targetRef = useRef('');
  /** Guards against grading the same attempt twice (settle timer vs. final result vs. `end`). */
  const gradedRef = useRef(true);
  const bestRef = useRef<{ transcript: string; score: number }>({ transcript: '', score: 0 });
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Held in a ref so the event listeners below never need to be torn down
  // and re-registered when the caller passes a fresh closure.
  const onAttemptRef = useRef(onAttempt);
  const passAccuracyRef = useRef(passAccuracy);

  useEffect(() => {
    onAttemptRef.current = onAttempt;
    passAccuracyRef.current = passAccuracy;
  }, [onAttempt, passAccuracy]);

  const clearTimers = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    settleTimerRef.current = null;
    maxTimerRef.current = null;
  }, []);

  const finish = useCallback(
    (early: boolean) => {
      if (gradedRef.current) return;
      gradedRef.current = true;
      clearTimers();
      setListening(false);
      setLevel(0);
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // Already stopped — nothing to unwind.
      }
      const best = bestRef.current;
      onAttemptRef.current({ transcript: best.transcript, score: best.score, early });
    },
    [clearTimers],
  );

  useSpeechRecognitionEvent('result', (event) => {
    if (gradedRef.current) return;
    const text = event.results[0]?.transcript?.trim();
    if (!text) return;

    setPartial(text);
    const score = textSimilarity(text, targetRef.current);
    // Keep the best reading of the attempt, not merely the last one — a
    // recognizer sometimes revises a good transcript into a worse one as
    // it reconsiders trailing audio.
    if (score >= bestRef.current.score) bestRef.current = { transcript: text, score };

    if (event.isFinal || score >= passAccuracyRef.current) {
      finish(!event.isFinal);
      return;
    }

    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => finish(true), SETTLE_MS);
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    // Native range is roughly -2 (silence) to 10 (loud).
    setLevel(Math.max(0, Math.min(1, (event.value + 2) / 12)));
  });

  useSpeechRecognitionEvent('end', () => {
    // The recognizer gave up on its own (silence, or a platform timeout).
    // Grade whatever we managed to hear rather than leaving the kid
    // staring at a spinning mic.
    finish(false);
  });

  useSpeechRecognitionEvent('error', () => {
    if (gradedRef.current) {
      setListening(false);
      return;
    }
    finish(false);
  });

  useEffect(() => {
    let cancelled = false;
    ExpoSpeechRecognitionModule.requestPermissionsAsync()
      .then((result) => {
        if (!cancelled) setAvailable(result.granted && ExpoSpeechRecognitionModule.isRecognitionAvailable());
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // Nothing running.
      }
    },
    [clearTimers],
  );

  const start = useCallback(
    (target: string) => {
      if (!available || !gradedRef.current) return;
      targetRef.current = target;
      gradedRef.current = false;
      bestRef.current = { transcript: '', score: 0 };
      setPartial('');
      setLevel(0);
      setListening(true);
      clearTimers();
      maxTimerRef.current = setTimeout(() => finish(true), MAX_LISTEN_MS);

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        // Biases the recognizer toward the exact words we're expecting,
        // which both improves accuracy on young/unclear speech and gets a
        // confident interim result sooner.
        contextualStrings: contextualWords(target),
        volumeChangeEventOptions: { enabled: true, intervalMillis: VOLUME_INTERVAL_MS },
      });
    },
    [available, clearTimers, finish],
  );

  const stop = useCallback(() => finish(true), [finish]);

  return { available, listening, partial, level, start, stop };
}

/** The target phrase plus its individual words — both forms help the recognizer's language model. */
function contextualWords(target: string): string[] {
  const words = target
    .replace(/[^\p{L}\p{N}\s']/gu, '')
    .split(/\s+/)
    .filter((w) => w.length > 1);
  return Array.from(new Set([target, ...words]));
}

/** Rough syllable split, used to coach a phrase back in bite-sized pieces after a stumble. */
export function splitSyllables(word: string): string[] {
  const clean = word.replace(/[^\p{L}']/gu, '');
  if (clean.length <= 3) return [clean];
  const chunks = clean.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi);
  return chunks && chunks.length > 0 ? chunks : [clean];
}
