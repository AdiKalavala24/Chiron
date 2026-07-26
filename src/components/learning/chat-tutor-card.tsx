import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Mic, Send, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import { generateNextTutorLine, type ChatTurn } from '@/features/gemini';
import type { ChatTutorPayload } from '@/features/curriculum';

interface ChatTutorCardProps {
  payload: ChatTutorPayload;
  /** chat_tutor has no right/wrong grading — completing the bounded conversation always counts as a positive interaction. */
  onComplete: () => void;
}

function WaveformBar({ index, active }: { index: number; active: boolean }) {
  const theme = useTheme();
  const height = useSharedValue(6);

  useEffect(() => {
    if (active) {
      height.value = withRepeat(
        withSequence(
          withTiming(6 + Math.random() * 16, { duration: 220 + index * 30 }),
          withTiming(6, { duration: 220 + index * 30 }),
        ),
        -1,
        true,
      );
    } else {
      height.value = withTiming(6, { duration: 150 });
    }
  }, [active, height, index]);

  const style = useAnimatedStyle(() => ({ height: height.value }));
  return <Animated.View style={[{ width: 4, borderRadius: 2, backgroundColor: theme.colors.accent }, style]} />;
}

function Waveform({ active }: { active: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 24 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <WaveformBar key={i} index={i} active={active} />
      ))}
    </View>
  );
}

export function ChatTutorCard({ payload, onComplete }: ChatTutorCardProps) {
  const theme = useTheme();
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [typedValue, setTypedValue] = useState('');
  const [micAvailable, setMicAvailable] = useState(false);
  const [done, setDone] = useState(false);
  const turnCountRef = useRef(0);
  const startedRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const startListening = () => {
    if (!micAvailable || listening) return;
    setListening(true);
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: false, continuous: false });
  };

  // Reveals the "Continue" button rather than auto-advancing — same pattern as
  // QuestionCard's "Next": the kid gets a beat to read the closing line first.
  const finishConversation = () => {
    setDone(true);
  };

  const handleKidTurn = async (transcript: string) => {
    setListening(false);
    ExpoSpeechRecognitionModule.stop();
    const nextHistory: ChatTurn[] = [...history, { role: 'kid', text: transcript }];
    setHistory(nextHistory);
    setTypedValue('');
    turnCountRef.current += 1;

    setThinking(true);
    const nextLine = await generateNextTutorLine(payload.persona, payload.objective, nextHistory, payload.sampleProbes, turnCountRef.current, payload.maxTurns);
    setThinking(false);

    setHistory((h) => [...h, { role: 'tutor', text: nextLine }]);
    const isLastTurn = turnCountRef.current >= payload.maxTurns;
    Speech.speak(nextLine, { onDone: () => (isLastTurn ? finishConversation() : undefined) });
  };

  const handleSendTyped = () => {
    const value = typedValue.trim();
    if (!value) return;
    void handleKidTurn(value);
  };

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript && event.isFinal) {
      void handleKidTurn(transcript);
    }
  });
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', () => setListening(false));

  useEffect(() => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync()
      .then((result) => setMicAvailable(result.granted && ExpoSpeechRecognitionModule.isRecognitionAvailable()))
      .catch(() => setMicAvailable(false));
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setHistory([{ role: 'tutor', text: payload.openingLine }]);
    Speech.speak(payload.openingLine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], marginBottom: theme.space[4] }}>
        <IconBadge size={44} backgroundColor={theme.colors.secondary} icon={<Sparkles size={20} color="#fff" strokeWidth={2.5} />} />
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>{payload.persona}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        style={{ maxHeight: 260 }}
        contentContainerStyle={{ gap: theme.space[3], paddingBottom: theme.space[2] }}
      >
        {history.map((turn, i) => (
          <View
            key={i}
            style={{
              alignSelf: turn.role === 'tutor' ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
              paddingHorizontal: theme.space[4],
              paddingVertical: theme.space[3],
              borderRadius: theme.radius.lg,
              borderTopLeftRadius: turn.role === 'tutor' ? theme.radius.sm : theme.radius.lg,
              borderTopRightRadius: turn.role === 'kid' ? theme.radius.sm : theme.radius.lg,
              borderWidth: theme.borderWidth.chunky,
              borderColor: theme.colors.foreground,
              backgroundColor: turn.role === 'tutor' ? theme.colors.card : theme.colors.accent,
            }}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bodyMedium,
                fontSize: theme.fontSize.base,
                color: turn.role === 'tutor' ? theme.colors.foreground : theme.colors.accentForeground,
              }}
            >
              {turn.text}
            </Text>
          </View>
        ))}
        {thinking ? (
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
            {payload.persona} is thinking…
          </Text>
        ) : null}
      </ScrollView>

      {!done ? (
        <View style={{ marginTop: theme.space[4], gap: theme.space[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
            <Pressable
              onPress={startListening}
              disabled={!micAvailable || listening || thinking}
              accessibilityRole="button"
              accessibilityLabel="Start speaking"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: theme.borderWidth.chunky,
                borderColor: theme.colors.foreground,
                backgroundColor: listening ? theme.colors.secondary : theme.colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: micAvailable ? 1 : 0.4,
              }}
            >
              <Mic size={20} color={theme.colors.foreground} strokeWidth={2.5} />
            </Pressable>
            <Waveform active={listening} />
            <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground }}>
              {listening ? 'Listening…' : micAvailable ? 'Tap the mic to talk' : 'Mic unavailable — type instead'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.space[2], alignItems: 'center' }}>
            <TextInput
              value={typedValue}
              onChangeText={setTypedValue}
              placeholder="...or type your answer"
              placeholderTextColor={theme.colors.mutedForeground}
              editable={!thinking}
              onSubmitEditing={handleSendTyped}
              style={{
                flex: 1,
                minHeight: 44,
                paddingHorizontal: theme.space[4],
                borderRadius: theme.radius.full,
                borderWidth: theme.borderWidth.chunky,
                borderColor: theme.colors.foreground,
                backgroundColor: theme.colors.input,
                fontFamily: theme.fontFamily.bodyMedium,
                color: theme.colors.foreground,
              }}
            />
            <Pressable
              onPress={handleSendTyped}
              disabled={thinking || !typedValue.trim()}
              accessibilityRole="button"
              accessibilityLabel="Send"
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: theme.borderWidth.chunky,
                borderColor: theme.colors.foreground,
                backgroundColor: theme.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: typedValue.trim() ? 1 : 0.5,
              }}
            >
              <Send size={16} color="#fff" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ marginTop: theme.space[4], alignItems: 'flex-start' }}>
          <CandyButton label="Continue" onPress={onComplete} />
        </View>
      )}
    </View>
  );
}
