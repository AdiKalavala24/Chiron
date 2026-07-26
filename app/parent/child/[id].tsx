import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Star, Target } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, HardShadow, IconBadge, PillChip, StickerCard } from '@/components/ui';
import { summarizeStats } from '@/features/parent';
import { useProfileStore } from '@/stores/profile-store';
import { useSessionStore } from '@/stores/session-store';

export default function ChildDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const child = useProfileStore((s) => s.children.find((c) => c.id === id));
  const activeChildId = useProfileStore((s) => s.activeChildId);
  const setActiveChild = useProfileStore((s) => s.setActiveChild);
  const allEvents = useSessionStore((s) => s.events);
  const events = useMemo(() => allEvents.filter((e) => e.childId === (id ?? '')), [allEvents, id]);
  const stats = summarizeStats(events);

  if (!child) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>Learner not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], paddingHorizontal: theme.space[5], paddingTop: theme.space[3] }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <IconBadge size={44} backgroundColor={theme.colors.card} icon={<ArrowLeft size={20} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>{child.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[5], paddingBottom: theme.space[10], gap: theme.space[4] }}>
        <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>Grade {child.grade}</Text>

        {activeChildId !== child.id ? (
          <CandyButton label="Make this the active learner" onPress={() => setActiveChild(child.id)} variant="secondary" showArrow={false} />
        ) : (
          <View style={{ flexDirection: 'row' }}>
            <PillChip label="Active learner" backgroundColor={theme.colors.quaternary} />
          </View>
        )}

        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground, marginTop: theme.space[2] }}>
          By subject
        </Text>

        {stats.length === 0 ? (
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>No graded activity yet.</Text>
        ) : (
          stats.map((s) => (
            <HardShadow key={s.subject} radius={theme.radius.md}>
              <View
                style={{
                  padding: theme.space[4],
                  borderRadius: theme.radius.md,
                  borderWidth: theme.borderWidth.chunky,
                  borderColor: theme.colors.foreground,
                  backgroundColor: theme.colors.card,
                }}
              >
                <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.base, color: theme.colors.foreground, textTransform: 'capitalize' }}>
                  {s.subject}
                </Text>
                <View style={{ flexDirection: 'row', gap: theme.space[5], marginTop: theme.space[3] }}>
                  <Stat icon={<Target size={16} color={theme.colors.foreground} strokeWidth={2.5} />} label="Accuracy" value={`${Math.round(s.accuracy * 100)}%`} />
                  <Stat icon={<CheckCircle2 size={16} color={theme.colors.foreground} strokeWidth={2.5} />} label="Completed" value={String(s.nodesCompleted)} />
                  <Stat icon={<Star size={16} color={theme.colors.foreground} strokeWidth={2.5} />} label="Mastered" value={String(s.nodesMastered)} />
                </View>
              </View>
            </HardShadow>
          ))
        )}

        <View style={{ marginTop: theme.space[4] }}>
          <StickerCard
            title="See the narrative debrief"
            subtitle="A counselor-style summary of this week"
            accentColor={theme.colors.secondary}
            onPress={() => router.push({ pathname: '/parent/debrief', params: { id: child.id } })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
        {icon}
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>{value}</Text>
      </View>
      <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.xs, color: theme.colors.mutedForeground }}>{label}</Text>
    </View>
  );
}
