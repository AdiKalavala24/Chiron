import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PartyPopper, Shuffle, Star } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, ConfettiField, IconBadge, PillChip } from '@/components/ui';
import { MethodPlayer } from '@/components/learning';
import { AffectCameraPreview, useCameraAffectEngine, type AffectSignal } from '@/features/affect';
import { useAffectAuditStore } from '@/stores/affect-audit-store';
import { INITIAL_BEHAVIOR_SIGNAL, useAdaptiveController, type BehaviorSignal } from '@/features/adaptive';
import { buildTechniqueEnsemble, getNode, pickStartingTechnique, TECHNIQUE_LABEL } from '@/features/curriculum';
import type { ContentBlock, Subject, TeachingMethod } from '@/features/curriculum';
import { generateLessonBlocks } from '@/features/gemini';
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
  const recordAudit = useAffectAuditStore((s) => s.record);

  /**
   * The five ways this node can be taught. Authored blocks where the path
   * has them, derived from the node's own content where it doesn't — so
   * every node in every subject has a full technique set for both the kid
   * and the adaptive controller to move between.
   */
  const ensemble = useMemo(() => (node ? buildTechniqueEnsemble(subject, node) : []), [node, subject]);

  // Lazy initializer, so the starting technique is drawn once per entry
  // into the lesson rather than re-rolled on every render.
  const [activeMethod, setActiveMethod] = useState<TeachingMethod>(() => pickStartingTechnique(ensemble) ?? 'question');
  const [instanceKey, setInstanceKey] = useState(0);
  const [behavior, setBehavior] = useState<BehaviorSignal>(INITIAL_BEHAVIOR_SIGNAL);
  const [latestAffect, setLatestAffect] = useState<AffectSignal | undefined>(undefined);
  const [celebrating, setCelebrating] = useState<'completed' | 'mastered' | null>(null);
  /**
   * Blocks generated on the fly (via Gemini) when the adaptive controller
   * wants to switch to a method this node wasn't authored with — most
   * hardcoded nodes only have one or two methods, so without this a
   * distracted/frustrated kid on a single-method node would have nowhere
   * to switch to. Session-only, never persisted, same spirit as the
   * "More like this" shuffled-fallback blocks lesson-generator.ts already
   * produces.
   */
  const [generatedBlocks, setGeneratedBlocks] = useState<ContentBlock[]>([]);
  const [generatingMethod, setGeneratingMethod] = useState<TeachingMethod | null>(null);

  // Seeded with 0, not Date.now() — reading the clock belongs in an effect,
  // not in an initializer evaluated during render.
  const lastInteractionAtRef = useRef(0);
  const lastAnswerAtRef = useRef<number | null>(null);
  const pendingCompletionRef = useRef<'completed' | 'mastered' | null>(null);

  const allBlocks = useMemo(() => [...ensemble.map((option) => option.block), ...generatedBlocks], [ensemble, generatedBlocks]);
  const activeBlock = allBlocks.find((b) => b.method === activeMethod) ?? allBlocks[0];
  // Memoized because it's a dependency of the adaptive controller's main
  // effect — a fresh array each render would re-run that effect on every
  // single render rather than only when the available methods change.
  const availableMethods = useMemo(() => allBlocks.map((b) => b.method), [allBlocks]);

  useEffect(() => {
    lastInteractionAtRef.current = Date.now();
    const id = setInterval(() => {
      setBehavior((b) => ({ ...b, msOnCurrentItem: Date.now() - lastInteractionAtRef.current }));
    }, BEHAVIOR_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const { cameraRef, onCameraReady, permissionGranted, requestPermission } = useCameraAffectEngine({
    active: !!child && !celebrating,
    onSignal: (signal) => {
      setLatestAffect(signal);
      if (signal.label !== 'neutral' && signal.confidence >= 0.6 && child && node) {
        logEvent({ childId: child.id, grade, subject, nodeId, type: 'affect_signal', detail: { label: signal.label, confidence: signal.confidence } });
      }
    },
    onReading: (reading) => {
      if (!child) return;
      recordAudit({
        kind: 'reading',
        childId: child.id,
        subject,
        nodeId,
        outcome: reading.outcome,
        label: reading.label,
        confidence: reading.confidence,
        diagnostics: reading.diagnostics,
        detail: reading.detail,
      });
    },
  });

  useEffect(() => {
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNeedFallbackContent = (method: TeachingMethod) => {
    if (!node) return;
    setGeneratingMethod(method);
    generateLessonBlocks({ grade, subject, node, preferredMethod: method })
      .then((result) => {
        setGeneratedBlocks((blocks) => [...blocks, ...result.blocks]);
      })
      .catch((error) => {
        console.warn('[adaptive] fallback content generation failed', error);
      })
      .finally(() => {
        setGeneratingMethod((current) => (current === method ? null : current));
      });
  };

  useAdaptiveController({
    currentMethod: activeMethod,
    behavior,
    latestAffect,
    availableMethods,
    onNeedFallbackContent: handleNeedFallbackContent,
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
    const nodeHasTargetMethod = allBlocks.some((b) => b.method === pending.toMethod);
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
    lastInteractionAtRef.current = Date.now();

    if (pendingRegulation) {
      clearPendingRegulation();
      logEvent({ childId: child.id, grade, subject, nodeId, type: 'regulation_triggered', detail: { nodeTitle: node.title } });
      router.push({ pathname: '/kid/regulation', params: { grade, subject, nodeId } });
    }
  };

  /**
   * Manual technique switch — advances to the next technique in the
   * ensemble. Exists so the whole rotation can be exercised on demand
   * (the camera-driven switch otherwise only fires under real
   * frustration/distraction, which is awkward to reproduce), and it
   * doubles as a kid-facing "I'd rather do this another way" escape
   * hatch. Logged like any other applied switch so parent analytics can
   * tell a chosen switch from an adaptive one.
   */
  const handleManualSwitch = () => {
    if (availableMethods.length < 2) return;
    const currentIndex = availableMethods.indexOf(activeMethod);
    const nextMethod = availableMethods[(currentIndex + 1) % availableMethods.length];
    if (nextMethod === activeMethod) return;

    consumePendingMethodChange(); // a queued adaptive switch is moot once we're moving anyway
    logEvent({
      childId: child.id,
      grade,
      subject,
      nodeId,
      type: 'method_switch_applied',
      detail: { fromMethod: activeMethod, toMethod: nextMethod, reason: 'chosen manually', nodeTitle: node.title },
    });
    setActiveMethod(nextMethod);
    setInstanceKey((k) => k + 1);
    setBehavior(INITIAL_BEHAVIOR_SIGNAL);
    lastInteractionAtRef.current = Date.now();
  };

  const handleItemAnswered = (correct: boolean) => {
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
        <PillChip
          label={TECHNIQUE_LABEL[activeMethod]}
          icon={<Shuffle size={14} color={theme.colors.foreground} strokeWidth={2.5} />}
          onPress={handleManualSwitch}
          testID="switch-technique"
        />
        {generatingMethod ? <ActivityIndicator size="small" color={theme.colors.mutedForeground} /> : null}
        {permissionGranted ? (
          <AffectCameraPreview
            ref={cameraRef}
            onCameraReady={onCameraReady}
            style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden' }}
          />
        ) : (
          <View style={{ width: 32, height: 32 }} />
        )}
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
