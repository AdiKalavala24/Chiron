import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useTheme } from '@/theme';
import { CandyButton } from '@/components/ui';
import { MicButton } from '@/components/learning/speak-practice-card';
import { splitSyllables, useFastPhraseRecognition, type PhraseAttempt } from '@/features/speech';
import type { GamePayload, SpeakPhrase } from '@/features/curriculum';
import { GameShell } from './game-shell';
import { AlienScene, type GameReactionState } from './scenes';

const PASS_ACCURACY = 0.6;
/** Rounds of banked power before the rocket is considered fully fuelled. */
const TARGET_ROUNDS = 5;

const GIBBERISH = ['Bleep bloop?', 'Zorp… zorp?', 'Blibble-blob!', 'Wooble wooble?'];

interface EchoSpaceAlienProps {
  payload: GamePayload;
  onItemAnswered: (correct: boolean) => void;
  onReadyForNextItem?: () => void;
}

/**
 * Speaking's flagship game. Echo is a "reverse tutor" alien learning
 * human words — the kid reads a target phrase aloud to power its rocket,
 * and the accuracy score becomes visible thrust.
 *
 * Scoring is the same honest Levenshtein-similarity proxy the speaking
 * drill uses (see `useFastPhraseRecognition`) — a fluency/accuracy
 * measure, not a phoneme-level pronunciation grade. The percentage shown
 * to the kid is that score, not a decorative number.
 *
 * The adaptive beat on a stumble is deliberately warm rather than
 * corrective: Echo makes a confused noise, then breaks the hardest word
 * into syllables to repeat together.
 */
export function EchoSpaceAlien({ payload, onItemAnswered, onReadyForNextItem }: EchoSpaceAlienProps) {
  const theme = useTheme();
  const phrases: SpeakPhrase[] = payload.speakPhrases ?? [];
  const [index, setIndex] = useState(0);
  const [power, setPower] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reaction, setReaction] = useState<GameReactionState>('idle');
  const [result, setResult] = useState<{ passed: boolean; percent: number; transcript: string } | null>(null);
  /** Nothing was picked up at all — Echo asks again rather than scoring a zero. */
  const [unheard, setUnheard] = useState(false);
  const gibberishRef = useRef(0);

  const phrase = phrases[index % Math.max(phrases.length, 1)];

  const handleAttempt = useCallback(
    ({ transcript, score }: PhraseAttempt) => {
      // Silence isn't a pronunciation attempt — don't grade it.
      if (!transcript.trim()) {
        setUnheard(true);
        Speech.stop();
        Speech.speak("Bleep? My ears did not catch anything. Try again!", { rate: 0.9, pitch: 1.6 });
        return;
      }
      setUnheard(false);
      const passed = score >= PASS_ACCURACY;
      const percent = Math.round(score * 100);
      setResult({ passed, percent, transcript });
      setReaction(passed ? 'correct' : 'incorrect');
      onItemAnswered(passed);

      if (passed) {
        setPower((p) => Math.min(TARGET_ROUNDS, p + 1));
        setMisses(0);
        Speech.stop();
        Speech.speak(`Whoa! You powered up my rocket by ${percent} percent!`, { rate: 0.95, pitch: 1.6 });
      } else {
        setMisses((n) => n + 1);
        const gibberish = GIBBERISH[gibberishRef.current % GIBBERISH.length];
        gibberishRef.current += 1;
        Speech.stop();
        Speech.speak(`${gibberish} Let's try it together, slowly.`, { rate: 0.85, pitch: 1.6 });
      }
    },
    [onItemAnswered],
  );

  const { available, listening, partial, level, start } = useFastPhraseRecognition({
    passAccuracy: PASS_ACCURACY,
    onAttempt: handleAttempt,
  });

  useEffect(
    () => () => {
      Speech.stop();
    },
    [],
  );

  const handleStart = () => {
    if (!available || listening || !phrase) return;
    Speech.stop();
    setResult(null);
    setUnheard(false);
    setReaction('idle');
    start(phrase.text);
  };

  const handleNext = () => {
    onReadyForNextItem?.();
    setResult(null);
    setUnheard(false);
    setReaction('idle');
    setIndex((i) => i + 1);
  };

  /** Echo reads the phrase back a syllable at a time after a stumble. */
  const speakSyllables = () => {
    if (!phrase) return;
    const hardest = phrase.text.split(/\s+/).reduce((longest, w) => (w.length > longest.length ? w : longest), '');
    Speech.stop();
    // expo-speech queues utterances, so one call per syllable reads them
    // back with a natural beat between each piece.
    for (const chunk of splitSyllables(hardest)) {
      Speech.speak(chunk, { rate: 0.6, pitch: 1.5 });
    }
  };

  if (!phrase) {
    return (
      <Text style={{ fontFamily: theme.fontFamily.body, color: theme.colors.mutedForeground }}>
        Echo has no phrases to learn yet.
      </Text>
    );
  }

  const syllables = splitSyllables(phrase.text.split(/\s+/).reduce((l, w) => (w.length > l.length ? w : l), ''));

  return (
    <GameShell
      skillChip={payload.skillChip}
      roundGoal={payload.roundGoal}
      colorHex="#34D399"
      reactionState={reaction}
      progressRatio={power / TARGET_ROUNDS}
      canvasHeight={230}
      scene={
        <AlienScene
          colorHex="#34D399"
          reactionState={reaction}
          progressRatio={power / TARGET_ROUNDS}
          micLevel={level}
          listening={listening}
        />
      }
    >
      <View
        style={{
          padding: theme.space[5],
          borderRadius: theme.radius.lg,
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.foreground,
          backgroundColor: theme.colors.card,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.xs, color: theme.colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Teach Echo this
        </Text>
        <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.xl, color: theme.colors.foreground, textAlign: 'center' }}>
          &ldquo;{phrase.text}&rdquo;
        </Text>
        {phrase.phoneticHint ? (
          <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
            {phrase.phoneticHint}
          </Text>
        ) : null}
      </View>

      <PowerMeter power={power} target={TARGET_ROUNDS} />

      <View style={{ alignItems: 'center', marginTop: theme.space[4] }}>
        <MicButton listening={listening} level={level} enabled={available} onPress={handleStart} />
        <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
          {listening ? 'Echo is listening…' : available ? 'Tap and say it to Echo' : 'Mic unavailable on this device'}
        </Text>
        {listening ? (
          <Text
            style={{
              marginTop: theme.space[2],
              minHeight: theme.lineHeight.base,
              fontFamily: theme.fontFamily.bodySemiBold,
              fontSize: theme.fontSize.base,
              color: theme.colors.accent,
              textAlign: 'center',
            }}
          >
            {partial}
          </Text>
        ) : null}
      </View>

      {result ? (
        <View
          style={{
            marginTop: theme.space[4],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: result.passed ? theme.colors.quaternary : theme.colors.tertiary,
          }}
        >
          <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            {result.passed
              ? `Your voice powered the rocket by ${result.percent}%!`
              : `${GIBBERISH[0]} Echo caught about ${result.percent}% of that.`}
          </Text>
          {result.transcript ? (
            <Text style={{ marginTop: 2, fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>
              Echo heard: &ldquo;{result.transcript}&rdquo;
            </Text>
          ) : null}
        </View>
      ) : null}

      {unheard ? (
        <View
          style={{
            marginTop: theme.space[4],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.muted,
          }}
        >
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            Bleep? Echo didn&rsquo;t catch anything — tap the mic and say it again.
          </Text>
        </View>
      ) : null}

      {misses > 0 && !listening ? (
        <View
          style={{
            marginTop: theme.space[3],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.muted,
          }}
        >
          <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>
            Echo wants to say it in small pieces with you:
          </Text>
          <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.accent }}>
            {syllables.join(' · ')}
          </Text>
          <View style={{ marginTop: theme.space[3], alignItems: 'flex-start' }}>
            <CandyButton label="Say it with Echo" onPress={speakSyllables} variant="secondary" showArrow={false} />
          </View>
        </View>
      ) : null}

      <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
        {result ? <CandyButton label="Next word" onPress={handleNext} /> : null}
        {!available && !result ? (
          <CandyButton
            label="Skip (mic unavailable)"
            onPress={() => {
              onItemAnswered(true);
              handleNext();
            }}
            variant="secondary"
            showArrow={false}
          />
        ) : null}
      </View>
    </GameShell>
  );
}

function PowerMeter({ power, target }: { power: number; target: number }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.space[4] }}>
      <Text style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: theme.fontSize.xs, color: theme.colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        Rocket power
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.space[2], marginTop: theme.space[2] }}>
        {Array.from({ length: target }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 14,
              borderRadius: theme.radius.full,
              borderWidth: theme.borderWidth.chunky,
              borderColor: theme.colors.foreground,
              backgroundColor: i < power ? theme.colors.quaternary : theme.colors.card,
            }}
          />
        ))}
      </View>
    </View>
  );
}
