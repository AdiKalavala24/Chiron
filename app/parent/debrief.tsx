import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircleHeart } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, HardShadow, IconBadge } from '@/components/ui';
import type { NarrativeDebrief } from '@/features/gemini';
import { useDebriefStore } from '@/stores/debrief-store';
import { useProfileStore } from '@/stores/profile-store';
import { useSessionStore } from '@/stores/session-store';

export default function NarrativeDebriefScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const children = useProfileStore((s) => s.children);
  const activeChildId = useProfileStore((s) => s.activeChildId);
  const childId = params.id ?? activeChildId ?? children[0]?.id;
  const child = children.find((c) => c.id === childId);
  const events = useSessionStore((s) => s.eventsForChild(childId ?? ''));
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
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>Narrative Debrief</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[5], paddingBottom: theme.space[10] }}>
        {!child ? (
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>No learner selected yet.</Text>
        ) : loading ? (
          <View style={{ paddingVertical: theme.space[10], alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={{ marginTop: theme.space[3], fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>Writing this week&rsquo;s summary…</Text>
          </View>
        ) : debrief ? (
          <>
            <HardShadow shadowColor={theme.colors.secondary} radius={theme.radius.lg}>
              <View
                style={{
                  padding: theme.space[5],
                  borderRadius: theme.radius.lg,
                  borderTopLeftRadius: theme.radius.sm,
                  borderWidth: theme.borderWidth.chunky,
                  borderColor: theme.colors.foreground,
                  backgroundColor: theme.colors.card,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], marginBottom: theme.space[4] }}>
                  <IconBadge size={40} backgroundColor={theme.colors.secondary} icon={<MessageCircleHeart size={18} color="#fff" strokeWidth={2.5} />} />
                  <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.base, color: theme.colors.foreground }}>
                    About {child.name}
                  </Text>
                </View>
                <Text style={{ fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.base, lineHeight: theme.lineHeight.lg, color: theme.colors.foreground }}>
                  {debrief.narrative}
                </Text>
              </View>
            </HardShadow>

            <View style={{ marginTop: theme.space[6], alignItems: 'flex-start' }}>
              <CandyButton label="See guidance" onPress={() => router.push({ pathname: '/parent/guidance', params: { id: child.id } })} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
