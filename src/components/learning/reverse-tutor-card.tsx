import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Mic, PawPrint } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import { assessReverseTutorExplanation } from '@/features/gemini';
import type { ReverseTutorPayload } from '@/features/curriculum';

interface ReverseTutorCardProps {
  payload: ReverseTutorPayload;
  onComplete: (understood: boolean) => void;
}

export function ReverseTutorCard({ payload, onComplete }: ReverseTutorCardProps) {
  const theme = useTheme();
  const [explanation, setExplanation] = useState('');
  const [listening, setListening] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [understood, setUnderstood] = useState(true);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript;
    if (text && event.isFinal) setExplanation((prev) => (prev ? `${prev} ${text}` : text));
  });
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', () => setListening(false));

  useEffect(() => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync()
      .then((result) => setMicAvailable(result.granted && ExpoSpeechRecognitionModule.isRecognitionAvailable()))
      .catch(() => setMicAvailable(false));
  }, []);

  const toggleListening = () => {
    if (!micAvailable) return;
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      setListening(false);
      return;
    }
    setListening(true);
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: false, continuous: true });
  };

  const handleSubmit = async () => {
    if (!explanation.trim()) return;
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      setListening(false);
    }
    setThinking(true);
    const assessment = await assessReverseTutorExplanation(payload.petName, payload.petPrompt, payload.conceptToTeach, payload.comprehensionChecks, explanation.trim());
    setThinking(false);
    setReply(assessment.reply);
    setUnderstood(assessment.understood);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], marginBottom: theme.space[4] }}>
        <IconBadge size={44} backgroundColor={theme.colors.tertiary} icon={<PawPrint size={20} color={theme.colors.foreground} strokeWidth={2.5} />} />
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>{payload.petName}</Text>
      </View>

      <View
        style={{
          alignSelf: 'flex-start',
          maxWidth: '90%',
          padding: theme.space[4],
          borderRadius: theme.radius.lg,
          borderTopLeftRadius: theme.radius.sm,
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.foreground,
          backgroundColor: theme.colors.card,
          marginBottom: theme.space[4],
        }}
      >
        <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>{payload.petPrompt}</Text>
      </View>

      {reply ? (
        <View
          style={{
            alignSelf: 'flex-start',
            maxWidth: '90%',
            padding: theme.space[4],
            borderRadius: theme.radius.lg,
            borderTopLeftRadius: theme.radius.sm,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.quaternary,
            marginBottom: theme.space[4],
          }}
        >
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>{reply}</Text>
        </View>
      ) : (
        <View style={{ gap: theme.space[3] }}>
          <TextInput
            value={explanation}
            onChangeText={setExplanation}
            editable={!thinking}
            multiline
            placeholder={`Explain "${payload.conceptToTeach}" to ${payload.petName}...`}
            placeholderTextColor={theme.colors.mutedForeground}
            style={{
              minHeight: 90,
              padding: theme.space[4],
              borderRadius: theme.radius.md,
              borderWidth: theme.borderWidth.chunky,
              borderColor: theme.colors.foreground,
              backgroundColor: theme.colors.input,
              fontFamily: theme.fontFamily.bodyMedium,
              fontSize: theme.fontSize.base,
              color: theme.colors.foreground,
              textAlignVertical: 'top',
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
            <Pressable onPress={toggleListening} disabled={!micAvailable} accessibilityRole="button" accessibilityLabel="Add to explanation by speaking">
              <IconBadge
                size={48}
                backgroundColor={listening ? theme.colors.secondary : theme.colors.card}
                icon={<Mic size={20} color={theme.colors.foreground} strokeWidth={2.5} />}
                style={{ opacity: micAvailable ? 1 : 0.4 }}
              />
            </Pressable>
            <Text style={{ flex: 1, fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
              {listening ? 'Listening — tap again to stop.' : micAvailable ? 'Tap the mic to add to your explanation by voice.' : 'Type your explanation below.'}
            </Text>
          </View>
        </View>
      )}

      <View style={{ marginTop: theme.space[5], alignItems: 'flex-start' }}>
        {!reply ? (
          <CandyButton
            label={thinking ? `${payload.petName} is listening…` : 'Teach ' + payload.petName}
            onPress={handleSubmit}
            disabled={thinking || !explanation.trim()}
            showArrow={!thinking}
          />
        ) : (
          <CandyButton label="Continue" onPress={() => onComplete(understood)} />
        )}
      </View>
    </View>
  );
}
