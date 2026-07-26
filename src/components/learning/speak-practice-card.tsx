import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Check, Mic, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import { textSimilarity } from '@/lib/random';
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
 */
export function SpeakPracticeCard({ payload, onPhraseAttempt, onAllPhrasesComplete, onReadyForNextItem }: SpeakPracticeCardProps) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);

  const phrase = payload.targetPhrases[index];

  const gradeAttempt = (heardText: string) => {
    const score = textSimilarity(heardText, phrase.text);
    const didPass = score >= payload.passAccuracy;
    setPassed(didPass);
    setChecked(true);
    onPhraseAttempt(didPass);
  };

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript;
    if (text && event.isFinal) {
      setTranscript(text);
      setListening(false);
      gradeAttempt(text);
    }
  });
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', () => setListening(false));

  useEffect(() => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync()
      .then((result) => setMicAvailable(result.granted && ExpoSpeechRecognitionModule.isRecognitionAvailable()))
      .catch(() => setMicAvailable(false));
  }, []);

  const startListening = () => {
    if (!micAvailable || listening) return;
    setChecked(false);
    setTranscript('');
    setListening(true);
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: false, continuous: false });
  };

  const handleNext = () => {
    onReadyForNextItem?.();
    const nextIndex = index + 1;
    setChecked(false);
    setTranscript('');
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
        <Pressable
          onPress={startListening}
          disabled={!micAvailable || listening}
          accessibilityRole="button"
          accessibilityLabel="Start speaking"
        >
          <IconBadge
            size={72}
            backgroundColor={listening ? theme.colors.secondary : theme.colors.accent}
            icon={<Mic size={28} color="#fff" strokeWidth={2.5} />}
            style={{ opacity: micAvailable ? 1 : 0.4 }}
          />
        </Pressable>
        <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
          {listening ? 'Listening…' : micAvailable ? 'Tap to say it out loud' : 'Mic unavailable on this device'}
        </Text>
      </View>

      {checked ? (
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
            backgroundColor: passed ? theme.colors.quaternary : theme.colors.tertiary,
          }}
        >
          <IconBadge
            size={32}
            backgroundColor={theme.colors.card}
            icon={passed ? <Check size={16} color={theme.colors.foreground} strokeWidth={3} /> : <X size={16} color={theme.colors.foreground} strokeWidth={3} />}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
              {passed ? 'Nice and clear!' : 'Good try — want to say it again?'}
            </Text>
            {transcript ? (
              <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.sm, color: theme.colors.foreground, marginTop: 2 }}>
                Heard: &ldquo;{transcript}&rdquo;
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
        {checked ? (
          <CandyButton label={index + 1 >= payload.targetPhrases.length ? 'Finish' : 'Next phrase'} onPress={handleNext} />
        ) : !micAvailable ? (
          <CandyButton label="Skip (mic unavailable)" onPress={() => { onPhraseAttempt(true); handleNext(); }} variant="secondary" showArrow={false} />
        ) : null}
      </View>
    </View>
  );
}
