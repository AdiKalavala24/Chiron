import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Baby, Sparkle, Star, Trophy, Rocket as RocketIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge, StickerCard } from '@/components/ui';
import { GRADE_BANDS, type GradeBand } from '@/features/curriculum';
import { useProfileStore } from '@/stores/profile-store';

const GRADE_LABEL: Record<GradeBand, string> = { K: 'Kindergarten', '1': '1st Grade', '2': '2nd Grade', '3': '3rd Grade', '4': '4th Grade' };
const GRADE_ICON: Record<GradeBand, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  K: Baby,
  '1': Sparkle,
  '2': Star,
  '3': RocketIcon,
  '4': Trophy,
};

export default function GradeSelectorScreen() {
  const theme = useTheme();
  const router = useRouter();
  const child = useProfileStore((s) => s.getActiveChild());
  const setChildGrade = useProfileStore((s) => s.setChildGrade);
  const [selected, setSelected] = useState<GradeBand | null>(child?.grade ?? null);
  const accentCycle = [theme.colors.accent, theme.colors.secondary, theme.colors.tertiary, theme.colors.quaternary];

  const handleContinue = () => {
    if (!child || !selected) return;
    setChildGrade(child.id, selected);
    router.push('/kid');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.space[6], paddingBottom: theme.space[10] }}>
        <Text style={{ fontFamily: theme.fontFamily.headingExtraBold, fontSize: theme.fontSize['3xl'], color: theme.colors.foreground, marginBottom: theme.space[6] }}>
          What grade are you in?
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[4] }}>
          {GRADE_BANDS.map((grade, i) => {
            const Icon = GRADE_ICON[grade];
            const accent = accentCycle[i % accentCycle.length];
            return (
              <View key={grade} style={{ width: '46%' }}>
                <StickerCard
                  title={GRADE_LABEL[grade]}
                  accentColor={accent}
                  selected={selected === grade}
                  onPress={() => setSelected(grade)}
                  icon={<IconBadge size={44} backgroundColor={accent} icon={<Icon size={20} color="#fff" strokeWidth={2.5} />} />}
                  testID={`grade-card-${grade}`}
                />
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: theme.space[8], alignItems: 'flex-start' }}>
          <CandyButton label="Let's go" onPress={handleContinue} disabled={!selected} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
