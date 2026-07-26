import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { HardShadow, IconBadge, StarBadge } from '@/components/ui';
import type { NarrativeDebrief } from '@/features/gemini';
import { useDebriefStore } from '@/stores/debrief-store';
import { useProfileStore } from '@/stores/profile-store';
import { useSessionStore } from '@/stores/session-store';

export default function GuidanceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const children = useProfileStore((s) => s.children);
  const activeChildId = useProfileStore((s) => s.activeChildId);
  const childId = params.id ?? activeChildId ?? children[0]?.id;
  const child = children.find((c) => c.id === childId);
  const allEvents = useSessionStore((s) => s.events);
  const events = useMemo(() => allEvents.filter((e) => e.childId === (childId ?? '')), [allEvents, childId]);
  const fetchDebrief = useDebriefStore((s) => s.fetchDebrief);

  const [debrief, setDebrief] = useState<NarrativeDebrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Render already checks `!child` before `loading`, so there's nothing to
    // synchronize here when there's no child yet — just skip the fetch.
    if (!child) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the fetch's loading state is the effect's entire purpose here.
    setLoading(true);
    fetchDebrief(child.id, child.name, events).then((result) => {
      if (!cancelled) {
        setDebrief(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], paddingHorizontal: theme.space[5], paddingTop: theme.space[3] }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <IconBadge size={44} backgroundColor={theme.colors.card} icon={<ArrowLeft size={20} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>Guidance</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[5], paddingBottom: theme.space[10], gap: theme.space[6] }}>
        {!child ? (
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>No learner selected yet.</Text>
        ) : loading ? (
          <View style={{ paddingVertical: theme.space[10], alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : (
          debrief?.guidance.map((rec, i) => (
            <View key={i} style={{ position: 'relative' }}>
              <HardShadow shadowColor={rec.mostHelpful ? theme.colors.tertiary : theme.colors.foreground} radius={theme.radius.lg}>
                <View
                  style={{
                    padding: theme.space[5],
                    borderRadius: theme.radius.lg,
                    borderWidth: theme.borderWidth.chunky,
                    borderColor: theme.colors.foreground,
                    backgroundColor: theme.colors.card,
                  }}
                >
                  <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>{rec.title}</Text>
                  <Text style={{ marginTop: theme.space[2], fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.base, lineHeight: theme.lineHeight.base, color: theme.colors.foreground }}>
                    {rec.body}
                  </Text>
                </View>
              </HardShadow>
              {rec.mostHelpful ? <StarBadge label="Most helpful tip" size={92} style={{ position: 'absolute', top: -18, right: -10 }} /> : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
