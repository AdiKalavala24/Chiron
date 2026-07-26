import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, Mic, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import { useFastPhraseRecognition } from '@/features/speech';
import type { SpeakPracticePayload } from '@/features/curriculum';

interface SpeakPracticeCardProps {
  payload: SpeakPracticePayload;
  onPhraseAttempt: (passed: boolean) => void;
  onAllPhrasesComplete: () => void;
  /** See QuestionCard's prop of the same name — fires right as the kid moves to a new phrase. */
  onReadyForNextItem?: () => void;
}

/**
 * Real on-device speech-to-text feeds a Levenshtein-similarity score
 * against the target phrase — an honest fluency/accuracy proxy, not a
 * true phoneme-level pronunciation grader (that needs a specialized
 * speech-scoring model). Close-but-imperfect transcripts still score
 * well, which is the right bias for a young reader.
 *
 * Latency is handled in `useFastPhraseRecognition`: interim results
 * stream a live transcript, and a correct reading is graded the instant
 * it scores a pass rather than after the platform's end-of-speech
 * timeout.
 */
export function SpeakPracticeCard({ payload, onPhraseAttempt, onAllPhrasesComplete, onReadyForNextItem }: SpeakPracticeCardProps) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ passed: boolean; transcript: string } | null>(null);
  /** The recognizer returned nothing at all — a missed recording, not a wrong answer. */
  const [unheard, setUnheard] = useState(false);

  const phrase = payload.targetPhrases[index];

  const handleAttempt = useCallback(
    ({ transcript, score }: { transcript: string; score: number }) => {
      // Silence isn't an assessment of anything. Grading it would count a
      // mic that never picked up against the kid's accuracy and push the
      // adaptive controller's consecutive-wrong count up for free.
      if (!transcript.trim()) {
        setUnheard(true);
        return;
      }
      const passed = score >= payload.passAccuracy;
      setUnheard(false);
      setResult({ passed, transcript });
      onPhraseAttempt(passed);
    },
    [payload.passAccuracy, onPhraseAttempt],
  );

  const { available, listening, partial, level, start } = useFastPhraseRecognition({
    passAccuracy: payload.passAccuracy,
    onAttempt: handleAttempt,
  });

  const handleStart = () => {
    if (!available || listening) return;
    setResult(null);
    setUnheard(false);
    start(phrase.text);
  };

  const handleNext = () => {
    onReadyForNextItem?.();
    const nextIndex = index + 1;
    setResult(null);
    setUnheard(false);
    if (nextIndex >= payload.targetPhrases.length) {
      onAllPhrasesComplete();
      return;
    }
    setIndex(nextIndex);
  };

  return (
    <View>
      <Text
        style={{
          fontFamily: theme.fontFamily.bodyBold,
          fontSize: theme.fontSize.xs,
          color: theme.colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: theme.space[3],
        }}
      >
        {payload.instructions}
      </Text>

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
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.xl, color: theme.colors.foreground, textAlign: 'center' }}>
          &ldquo;{phrase.text}&rdquo;
        </Text>
        {phrase.phoneticHint ? (
          <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
            {phrase.phoneticHint}
          </Text>
        ) : null}
      </View>

      <View style={{ alignItems: 'center', marginTop: theme.space[5] }}>
        <MicButton listening={listening} level={level} enabled={available} onPress={handleStart} />
        <Text
          style={{
            marginTop: theme.space[2],
            fontFamily: theme.fontFamily.bodyMedium,
            fontSize: theme.fontSize.sm,
            color: theme.colors.mutedForeground,
            textAlign: 'center',
          }}
        >
          {listening ? 'Listening…' : available ? 'Tap to say it out loud' : 'Mic unavailable on this device'}
        </Text>
        {/* Live transcript — the kid sees words appear as they speak, which is
            what makes the interaction feel instant even before it's graded. */}
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
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space[3],
            marginTop: theme.space[5],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: result.passed ? theme.colors.quaternary : theme.colors.tertiary,
          }}
        >
          <IconBadge
            size={32}
            backgroundColor={theme.colors.card}
            icon={
              result.passed ? (
                <Check size={16} color={theme.colors.foreground} strokeWidth={3} />
              ) : (
                <X size={16} color={theme.colors.foreground} strokeWidth={3} />
              )
            }
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
              {result.passed ? 'Nice and clear!' : 'Good try — want to say it again?'}
            </Text>
            {result.transcript ? (
              <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.sm, color: theme.colors.foreground, marginTop: 2 }}>
                Heard: &ldquo;{result.transcript}&rdquo;
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {unheard ? (
        <View
          style={{
            marginTop: theme.space[5],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.muted,
          }}
        >
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
            We didn&rsquo;t hear anything that time — tap the mic and try again.
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
        {result ? (
          <CandyButton label={index + 1 >= payload.targetPhrases.length ? 'Finish' : 'Next phrase'} onPress={handleNext} />
        ) : !available ? (
          <CandyButton
            label="Skip (mic unavailable)"
            onPress={() => {
              onPhraseAttempt(true);
              handleNext();
            }}
            variant="secondary"
            showArrow={false}
          />
        ) : null}
      </View>
    </View>
  );
}

/**
 * Mic button whose ring scales with live input level. Shared with Echo
 * the Space Alien so both speech surfaces show the same "I can hear you"
 * signal.
 */
export function MicButton({
  listening,
  level,
  enabled,
  onPress,
  size = 72,
}: {
  listening: boolean;
  level: number;
  enabled: boolean;
  onPress: () => void;
  size?: number;
}) {
  const theme = useTheme();
  const ringScale = 1 + (listening ? level * 0.45 : 0);

  return (
    <Pressable onPress={onPress} disabled={!enabled || listening} accessibilityRole="button" accessibilityLabel="Start speaking">
      <View style={{ width: size * 1.5, height: size * 1.5, alignItems: 'center', justifyContent: 'center' }}>
        {listening ? (
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.colors.secondary,
              opacity: 0.35,
              transform: [{ scale: ringScale }],
            }}
          />
        ) : null}
        <IconBadge
          size={size}
          backgroundColor={listening ? theme.colors.secondary : theme.colors.accent}
          icon={<Mic size={size * 0.39} color="#fff" strokeWidth={2.5} />}
          style={{ opacity: enabled ? 1 : 0.4 }}
        />
      </View>
    </Pressable>
  );
}
