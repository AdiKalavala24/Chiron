import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CameraOff, Eye, EyeOff, Frown, Shuffle, TriangleAlert } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { HardShadow, IconBadge, PillChip } from '@/components/ui';
import { ADAPTIVE_THRESHOLDS } from '@/features/adaptive';
import { CLASSIFIER_THRESHOLDS } from '@/features/affect';
import { summarizeAffectAudit, useAffectAuditStore, type AffectAuditEntry } from '@/stores/affect-audit-store';

/**
 * Read-only view of what the camera actually saw, tick by tick — the
 * answer to "is distraction detection really running, and is it firing?"
 *
 * Ordered newest-first because the question this screen answers is almost
 * always about the last few seconds, not the start of the session.
 */
export default function AffectAuditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const entries = useAffectAuditStore((s) => s.entries);
  const clear = useAffectAuditStore((s) => s.clear);

  const summary = useMemo(() => summarizeAffectAudit(entries, ADAPTIVE_THRESHOLDS.distractionConfidence), [entries]);
  const newestFirst = useMemo(() => [...entries].reverse(), [entries]);

  const sensingLooksBroken = summary.totalReadings > 0 && summary.classified === 0 && summary.failed > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space[3],
          paddingHorizontal: theme.space[5],
          paddingTop: theme.space[3],
          paddingBottom: theme.space[2],
        }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <IconBadge size={44} backgroundColor={theme.colors.card} icon={<ArrowLeft size={20} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        <Text style={{ flex: 1, fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>
          Attention log
        </Text>
        {entries.length > 0 ? <PillChip label="Clear" onPress={clear} backgroundColor={theme.colors.muted} /> : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[5], paddingBottom: theme.space[10], gap: theme.space[4] }}>
        <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground, lineHeight: theme.lineHeight.sm }}>
          Every camera check during a lesson, including the ones that saw nothing. Kept in memory only — this clears when the app restarts, and is never written to disk.
        </Text>

        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <HardShadow radius={theme.radius.md}>
              <View
                style={{
                  padding: theme.space[4],
                  borderRadius: theme.radius.md,
                  borderWidth: theme.borderWidth.chunky,
                  borderColor: theme.colors.foreground,
                  backgroundColor: theme.colors.card,
                  gap: theme.space[3],
                }}
              >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[5] }}>
                  <Stat label="Checks" value={String(summary.totalReadings)} />
                  <Stat label="Distracted" value={String(summary.distracted)} tone={summary.distracted > 0 ? theme.colors.warning : undefined} />
                  <Stat label="Frustrated" value={String(summary.frustrated)} tone={summary.frustrated > 0 ? theme.colors.warning : undefined} />
                  <Stat label="No face" value={String(summary.noFace)} />
                  <Stat label="Failed" value={String(summary.failed)} tone={summary.failed > 0 ? theme.colors.danger : undefined} />
                </View>
                <View style={{ height: theme.borderWidth.hairline, backgroundColor: theme.colors.border }} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[5] }}>
                  <Stat
                    label={`Longest run (needs ${ADAPTIVE_THRESHOLDS.distractionStreak})`}
                    value={String(summary.longestDistractedRun)}
                    tone={summary.longestDistractedRun >= ADAPTIVE_THRESHOLDS.distractionStreak ? theme.colors.warning : undefined}
                  />
                  <Stat label="Switches fired" value={String(summary.switchesQueued)} tone={summary.switchesQueued > 0 ? theme.colors.accent : undefined} />
                  <Stat label="Content generated" value={String(summary.contentRequests)} />
                </View>
              </View>
            </HardShadow>

            {sensingLooksBroken ? (
              <Callout
                tone={theme.colors.danger}
                icon={<TriangleAlert size={16} color={theme.colors.foreground} strokeWidth={2.5} />}
                text="Every check failed and none produced a reading. Distraction detection is not running — see the reasons in the list below."
              />
            ) : null}

            {newestFirst.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState() {
  const theme = useTheme();
  return (
    <View
      style={{
        padding: theme.space[5],
        borderRadius: theme.radius.lg,
        borderWidth: theme.borderWidth.chunky,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        gap: theme.space[3],
      }}
    >
      <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
        Nothing recorded yet
      </Text>
      <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground, lineHeight: theme.lineHeight.sm }}>
        Entries appear once a child opens a lesson and the camera starts checking, about once every five seconds.
      </Text>
      <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.sm, color: theme.colors.mutedForeground, lineHeight: theme.lineHeight.sm }}>
        If a lesson has been open and this is still empty, camera permission was most likely denied — nothing is being sensed at all.
      </Text>
    </View>
  );
}

function Callout({ tone, icon, text }: { tone: string; icon: React.ReactNode; text: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space[3],
        padding: theme.space[4],
        borderRadius: theme.radius.md,
        borderWidth: theme.borderWidth.chunky,
        borderColor: tone,
        backgroundColor: theme.colors.card,
      }}
    >
      <IconBadge size={36} backgroundColor={tone} icon={icon} />
      <Text style={{ flex: 1, fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>{text}</Text>
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'flex-start', minWidth: 72 }}>
      <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: tone ?? theme.colors.foreground }}>{value}</Text>
      <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.xs, color: theme.colors.mutedForeground }}>{label}</Text>
    </View>
  );
}

function formatClock(at: number): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function EntryRow({ entry }: { entry: AffectAuditEntry }) {
  const theme = useTheme();
  const { icon, tone, title, detail } = describeEntry(entry, theme.colors);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.space[3],
        paddingVertical: theme.space[3],
        paddingHorizontal: theme.space[4],
        borderRadius: theme.radius.md,
        borderWidth: theme.borderWidth.hairline,
        borderColor: theme.colors.border,
        backgroundColor: entry.kind === 'decision' ? theme.colors.muted : theme.colors.card,
      }}
    >
      <IconBadge size={32} backgroundColor={tone} icon={icon} />
      <View style={{ flex: 1, gap: theme.space[1] }}>
        <Text style={{ fontFamily: theme.fontFamily.bodySemiBold, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>{title}</Text>
        {detail ? (
          <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.xs, color: theme.colors.mutedForeground, lineHeight: theme.lineHeight.xs }}>
            {detail}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.xs, color: theme.colors.mutedForeground }}>{formatClock(entry.at)}</Text>
    </View>
  );
}

type ThemeColors = ReturnType<typeof useTheme>['colors'];

function describeEntry(
  entry: AffectAuditEntry,
  colors: ThemeColors,
): { icon: React.ReactNode; tone: string; title: string; detail?: string } {
  const iconProps = { size: 15, color: colors.foreground, strokeWidth: 2.5 } as const;

  if (entry.kind === 'decision') {
    const target = entry.toMethod ? entry.toMethod.replace(/_/g, ' ') : 'another style';
    return {
      icon: <Shuffle {...iconProps} />,
      tone: colors.accent,
      title:
        entry.decision === 'switch_queued'
          ? `Switch triggered -> ${target}`
          : `Needed ${target}, generating it`,
      detail: entry.reason || undefined,
    };
  }

  if (entry.outcome === 'capture_failed' || entry.outcome === 'classifier_unavailable') {
    return {
      icon: <CameraOff {...iconProps} />,
      tone: colors.danger,
      title: entry.outcome === 'classifier_unavailable' ? 'Model unavailable' : 'Camera check failed',
      detail: entry.detail,
    };
  }

  if (entry.outcome === 'no_face') {
    return {
      icon: <EyeOff {...iconProps} />,
      tone: colors.warning,
      title: 'No face in frame',
      detail: 'Counted as distracted — nobody was looking at the screen.',
    };
  }

  // A real classification. Show the number the verdict actually turned on,
  // so a wrong-looking call can be traced to the threshold that produced it.
  const label = entry.label ?? 'neutral';
  const confidence = entry.confidence !== undefined ? ` (${Math.round(entry.confidence * 100)}%)` : '';
  const d = entry.diagnostics;
  const parts: string[] = [];
  if (d?.headOffAxisDeg !== undefined) {
    parts.push(`head ${Math.round(d.headOffAxisDeg)}° off-axis (bar ${CLASSIFIER_THRESHOLDS.offAxisDistractedDeg}°)`);
  }
  if (d?.frustrationScore !== undefined) {
    parts.push(`frustration ${d.frustrationScore.toFixed(2)} (bar ${CLASSIFIER_THRESHOLDS.frustration})`);
  }

  const distracting = label === 'distracted';
  const negative = label === 'frustrated' || label === 'distaste';

  return {
    icon: distracting ? <EyeOff {...iconProps} /> : negative ? <Frown {...iconProps} /> : <Eye {...iconProps} />,
    tone: distracting ? colors.warning : negative ? colors.secondary : colors.quaternary,
    title: `${label.charAt(0).toUpperCase()}${label.slice(1)}${confidence}`,
    detail: parts.length > 0 ? parts.join(' · ') : undefined,
  };
}
