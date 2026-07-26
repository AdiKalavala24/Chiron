import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Calculator, Mic, PenLine } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { IconBadge, PillChip, StickerCard } from '@/components/ui';
import { SUBJECTS, type Subject } from '@/features/curriculum';
import { useProfileStore } from '@/stores/profile-store';
import { useProgressStore } from '@/stores/progress-store';

const SUBJECT_LABEL: Record<Subject, string> = { reading: 'Reading', writing: 'Writing', math: 'Math', speaking: 'Speaking' };
const SUBJECT_ICON: Record<Subject, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  reading: BookOpen,
  writing: PenLine,
  math: Calculator,
  speaking: Mic,
};

export default function SubjectHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const child = useProfileStore((s) => s.getActiveChild());
  const getPathCompletionRatio = useProgressStore((s) => s.getPathCompletionRatio);
  const accentCycle = [theme.colors.accent, theme.colors.secondary, theme.colors.tertiary, theme.colors.quaternary];
  const grade = child?.grade ?? 'K';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.space[6], paddingBottom: theme.space[10] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.space[6] }}>
          <Text style={{ fontFamily: theme.fontFamily.headingExtraBold, fontSize: theme.fontSize['2xl'], color: theme.colors.foreground }}>
            What do you want to learn?
          </Text>
        </View>

        <View style={{ marginBottom: theme.space[6], alignItems: 'flex-start' }}>
          <PillChip label={`Grade ${grade === 'K' ? 'K' : grade}`} onPress={() => router.push('/kid/grade')} />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[4] }}>
          {SUBJECTS.map((subject, i) => {
            const Icon = SUBJECT_ICON[subject];
            const accent = accentCycle[i % accentCycle.length];
            const ratio = getPathCompletionRatio(grade, subject);
            return (
              <View key={subject} style={{ width: '46%' }}>
                <StickerCard
                  title={SUBJECT_LABEL[subject]}
                  subtitle={ratio > 0 ? `${Math.round(ratio * 100)}% complete` : 'Not started yet'}
                  accentColor={accent}
                  icon={<IconBadge size={44} backgroundColor={accent} icon={<Icon size={20} color="#fff" strokeWidth={2.5} />} />}
                  onPress={() => router.push({ pathname: '/kid/subject/[subject]', params: { subject } })}
                  testID={`subject-card-${subject}`}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
