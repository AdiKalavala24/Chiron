import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircleHeart, Sparkles, UserRound } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge, PillChip, StickerCard } from '@/components/ui';
import { summarizeStats } from '@/features/parent';
import { useProfileStore } from '@/stores/profile-store';
import { useSessionStore } from '@/stores/session-store';

export default function ParentAnalyticsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const children = useProfileStore((s) => s.children);
  const events = useSessionStore((s) => s.events);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], paddingHorizontal: theme.space[5], paddingTop: theme.space[3], paddingBottom: theme.space[2] }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <IconBadge size={44} backgroundColor={theme.colors.card} icon={<ArrowLeft size={20} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>Family Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.space[5], paddingBottom: theme.space[10], gap: theme.space[5] }}>
        <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
          <View style={{ flex: 1 }}>
            <CandyButton label="Narrative debrief" onPress={() => router.push('/parent/debrief')} accentColor={theme.colors.secondary} showArrow={false} />
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <PillChip
            label="Guidance recs"
            icon={<Sparkles size={14} color={theme.colors.foreground} strokeWidth={2.5} />}
            onPress={() => router.push('/parent/guidance')}
          />
        </View>

        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.xl, color: theme.colors.foreground, marginTop: theme.space[3] }}>
          Your learners
        </Text>

        {children.length === 0 ? (
          <View
            style={{
              padding: theme.space[5],
              borderRadius: theme.radius.lg,
              borderWidth: theme.borderWidth.chunky,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
            }}
          >
            <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground }}>
              No learner profile yet — once your child taps &ldquo;I&rsquo;m a Kid&rdquo; on the home screen, they&rsquo;ll show up here.
            </Text>
          </View>
        ) : (
          children.map((child) => {
            const childStats = summarizeStats(events.filter((e) => e.childId === child.id));
            const totalAttempts = childStats.reduce((sum, s) => sum + s.attempts, 0);
            return (
              <StickerCard
                key={child.id}
                title={child.name}
                subtitle={totalAttempts > 0 ? `${totalAttempts} question${totalAttempts === 1 ? '' : 's'} answered so far` : 'No activity yet'}
                accentColor={theme.colors.accent}
                icon={<IconBadge size={44} backgroundColor={theme.colors.accent} icon={<UserRound size={20} color="#fff" strokeWidth={2.5} />} />}
                onPress={() => router.push({ pathname: '/parent/child/[id]', params: { id: child.id } })}
              />
            );
          })
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space[3],
            marginTop: theme.space[4],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.muted,
          }}
        >
          <IconBadge size={36} backgroundColor={theme.colors.card} icon={<MessageCircleHeart size={16} color={theme.colors.foreground} strokeWidth={2.5} />} />
          <Text style={{ flex: 1, fontFamily: theme.fontFamily.body, fontSize: theme.fontSize.sm, color: theme.colors.foreground }}>
            The narrative debrief reads like a note from a counselor, not a report card — it&rsquo;s meant to be a starting point for a conversation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
