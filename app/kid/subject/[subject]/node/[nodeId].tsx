import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PartyPopper, Star } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, ConfettiField, IconBadge, PillChip } from '@/components/ui';
import { MethodPlayer } from '@/components/learning';
import { AffectCameraPreview, useCameraAffectEngine, type AffectSignal } from '@/features/affect';
import { INITIAL_BEHAVIOR_SIGNAL, useAdaptiveController, type BehaviorSignal } from '@/features/adaptive';
import { getNode } from '@/features/curriculum';
import type { Subject, TeachingMethod } from '@/features/curriculum';
import { useProfileStore } from '@/stores/profile-store';
import { useProgressStore } from '@/stores/progress-store';
import { useSessionStore } from '@/stores/session-store';

const RAPID_GUESS_MS = 900;
const BEHAVIOR_TICK_MS = 4000;

export default function NodePlayerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ subject: string; nodeId: string }>();
  const subject = params.subject as Subject;
  const nodeId = params.nodeId as string;

  const child = useProfileStore((s) => s.getActiveChild());
  const grade = child?.grade ?? 'K';
  const node = getNode(grade, subject, nodeId);

  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const completeNodeDirectly = useProgressStore((s) => s.completeNodeDirectly);
  const logEvent = useSessionStore((s) => s.logEvent);
  const consumePendingMethodChange = useSessionStore((s) => s.consumePendingMethodChange);
  const pendingRegulation = useSessionStore((s) => s.pendingRegulation);
  const clearPendingRegulation = useSessionStore((s) => s.clearPendingRegulation);

  const [activeMethod, setActiveMethod] = useState<TeachingMethod>(node?.blocks[0]?.method ?? 'question');
  const [instanceKey, setInstanceKey] = useState(0);
  const [behavior, setBehavior] = useState<BehaviorSignal>(INITIAL_BEHAVIOR_SIGNAL);
  const [latestAffect, setLatestAffect] = useState<AffectSignal | undefined>(undefined);
  const [celebrating, setCelebrating] = useState<'completed' | 'mastered' | null>(null);

  // Seeded with 0, not Date.now() — reading the clock belongs in an effect,
  // not in an initializer evaluated during render.
  const lastInteractionAtRef = useRef(0);
  const lastAnswerAtRef = useRef<number | null>(null);
  const pendingCompletionRef = useRef<'completed' | 'mastered' | null>(null);

  const activeBlock = node?.blocks.find((b) => b.method === activeMethod) ?? node?.blocks[0];

  useEffect(() => {
    lastInteractionAtRef.current = Date.now();
    const id = setInterval(() => {
      setBehavior((b) => ({ ...b, msOnCurrentItem: Date.now() - lastInteractionAtRef.current }));
    }, BEHAVIOR_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const { permissionGranted, requestPermission } = useCameraAffectEngine({
    active: !!child && !celebrating,
    onSignal: (signal) => {
      setLatestAffect(signal);
      if (signal.label !== 'neutral' && signal.confidence >= 0.6 && child && node) {
        logEvent({ childId: child.id, grade, subject, nodeId, type: 'affect_signal', detail: { label: signal.label, confidence: signal.confidence } });
      }
    },
  });

  useEffect(() => {
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAdaptiveController({
    currentMethod: activeMethod,
    behavior,
    latestAffect,
    childId: child?.id ?? 'unknown',
    grade,
    subject,
    nodeId,
  });

  if (!child || !node) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.space[6] }}>
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground, textAlign: 'center' }}>
          We couldn&rsquo;t find that lesson.
        </Text>
        <View style={{ marginTop: theme.space[5] }}>
          <CandyButton label="Go back" onPress={() => router.back()} showArrow={false} />
        </View>
      </View>
    );
  }

  const applyPendingSwitchIfAny = () => {
    const pending = consumePendingMethodChange();
    if (!pending) return;
    const nodeHasTargetMethod = node.blocks.some((b) => b.method === pending.toMethod);
    if (!nodeHasTargetMethod || pending.toMethod === activeMethod) return;

    logEvent({
      childId: child.id,
      grade,
      subject,
      nodeId,
      type: 'method_switch_applied',
      detail: { fromMethod: pending.fromMethod, toMethod: pending.toMethod, reason: pending.reason, nodeTitle: node.title },
    });
    setActiveMethod(pending.toMethod);
    setInstanceKey((k) => k + 1);
    setBehavior(INITIAL_BEHAVIOR_SIGNAL);
    // eslint-disable-next-line react-hooks/purity -- this runs from a child callback in response to a user action, never during render.
    lastInteractionAtRef.current = Date.now();

    if (pendingRegulation) {
      clearPendingRegulation();
      logEvent({ childId: child.id, grade, subject, nodeId, type: 'regulation_triggered', detail: { nodeTitle: node.title } });
      router.push({ pathname: '/kid/regulation', params: { grade, subject, nodeId } });
    }
  };

  const handleItemAnswered = (correct: boolean) => {
    // eslint-disable-next-line react-hooks/purity -- this runs from a child callback in response to a graded answer, never during render.
    const now = Date.now();
    const delta = lastAnswerAtRef.current ? now - lastAnswerAtRef.current : Number.POSITIVE_INFINITY;
    lastAnswerAtRef.current = now;
    lastInteractionAtRef.current = now;

    setBehavior((b) => ({
      consecutiveWrong: correct ? 0 : b.consecutiveWrong + 1,
      msOnCurrentItem: 0,
      rapidGuessCount: delta < RAPID_GUESS_MS ? b.rapidGuessCount + 1 : b.rapidGuessCount,
    }));

    logEvent({ childId: child.id, grade, subject, nodeId, type: 'item_answered', detail: { correct, nodeTitle: node.title } });

    const result = recordAnswer(grade, subject, nodeId, correct);
    if (result.completedNode) {
      logEvent({ childId: child.id, grade, subject, nodeId, type: 'node_completed', detail: { nodeTitle: node.title } });
      pendingCompletionRef.current = 'completed';
    }
    if (result.masteredNode) {
      logEvent({ childId: child.id, grade, subject, nodeId, type: 'node_mastered', detail: { nodeTitle: node.title } });
      pendingCompletionRef.current = 'mastered';
    }
  };

  /** The only safe moment to reveal a completion celebration or apply a queued method switch — never mid-item. */
  const handleReadyForNextItem = () => {
    if (pendingCompletionRef.current) {
      setCelebrating(pendingCompletionRef.current);
      pendingCompletionRef.current = null;
      return;
    }
    applyPendingSwitchIfAny();
  };

  const handleDrillPassComplete = () => {
    if (pendingCompletionRef.current) {
      setCelebrating(pendingCompletionRef.current);
      pendingCompletionRef.current = null;
      return;
    }
    applyPendingSwitchIfAny();
    setInstanceKey((k) => k + 1);
  };

  const handleHolisticComplete = () => {
    consumePendingMethodChange(); // moot — this node is ending regardless
    const didComplete = completeNodeDirectly(grade, subject, nodeId);
    if (didComplete) {
      logEvent({ childId: child.id, grade, subject, nodeId, type: 'node_completed', detail: { nodeTitle: node.title } });
      setCelebrating('completed');
    } else {
      router.back();
    }
  };

  if (celebrating) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ConfettiField />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.space[8] }}>
          <IconBadge
            size={96}
            backgroundColor={celebrating === 'mastered' ? theme.colors.tertiary : theme.colors.quaternary}
            icon={celebrating === 'mastered' ? <Star size={40} color={theme.colors.foreground} strokeWidth={2.5} fill={theme.colors.foreground} /> : <PartyPopper size={40} color={theme.colors.foreground} strokeWidth={2.5} />}
          />
          <Text style={{ marginTop: theme.space[5], fontFamily: theme.fontFamily.headingExtraBold, fontSize: theme.fontSize['2xl'], color: theme.colors.foreground, textAlign: 'center' }}>
            {celebrating === 'mastered' ? 'Mastered it!' : 'Skill complete!'}
          </Text>
          <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.mutedForeground, textAlign: 'center' }}>
            {node.title} — nice work.
          </Text>
          <View style={{ marginTop: theme.space[7] }}>
            <CandyButton label="Back to path" onPress={() => router.back()} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.space[5],
          paddingTop: theme.space[6],
          paddingBottom: theme.space[3],
        }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <IconBadge size={44} backgroundColor={theme.colors.card} icon={<ArrowLeft size={20} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        <PillChip label={METHOD_LABEL[activeMethod]} />
        {permissionGranted ? <AffectCameraPreview style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden' }} /> : <View style={{ width: 32, height: 32 }} />}
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[5], paddingBottom: theme.space[12] }}>
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize['2xl'], color: theme.colors.foreground, marginBottom: theme.space[1] }}>
          {node.title}
        </Text>
        <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground, marginBottom: theme.space[6] }}>
          {node.skill.replace(/-/g, ' ')}
        </Text>

        {activeBlock ? (
          <MethodPlayer
            key={`${activeMethod}-${instanceKey}`}
            block={activeBlock}
            onItemAnswered={handleItemAnswered}
            onDrillPassComplete={handleDrillPassComplete}
            onHolisticComplete={handleHolisticComplete}
            onReadyForNextItem={handleReadyForNextItem}
          />
        ) : (
          <Text style={{ fontFamily: theme.fontFamily.body, color: theme.colors.mutedForeground }}>This skill has no content yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const METHOD_LABEL: Record<TeachingMethod, string> = {
  question: 'Questions',
  video: 'Video',
  game_3d: 'Game',
  chat_tutor: 'Voice Tutor',
  trace: 'Trace',
  speak_practice: 'Speaking',
  reverse_tutor: 'Teach the Pet',
  story_mission: 'Story',
  regulation: 'Reset',
};
