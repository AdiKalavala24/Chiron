import { useRouter } from 'expo-router';
import { MessageCircleHeart, Sparkles, Timer } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/button';
import { StickerCard } from '@/components/ui/card';
import { CircleDecoration, DotGrid, Squiggle } from '@/components/ui/shapes';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PILLARS = [
  {
    title: 'Adaptive pacing',
    body: "Notices hesitation and rushed guesses, not just right vs. wrong — and adjusts before frustration sets in.",
    icon: <Timer size={20} color="#FFFFFF" strokeWidth={2.5} />,
    iconBackground: 'accent' as const,
  },
  {
    title: 'Celebrates the wins',
    body: 'A real streak gets a real reaction — confetti, a harder challenge, and a moment to feel proud.',
    icon: <Sparkles size={20} color="#FFFFFF" strokeWidth={2.5} />,
    iconBackground: 'secondary' as const,
  },
  {
    title: 'Human debriefs',
    body: 'Parents get a specific, human update after each session — not another progress bar to ignore.',
    icon: <MessageCircleHeart size={20} color="#FFFFFF" strokeWidth={2.5} />,
    iconBackground: 'quaternary' as const,
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <DotGrid color="border" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.hero}>
            <CircleDecoration size={260} color="tertiary" style={styles.heroCircle} />
            <ThemedText type="display" style={styles.heroTitle}>
              Meet Chiron
            </ThemedText>
            <Squiggle width={140} color="accent" style={styles.squiggle} />
            <ThemedText type="bodyLg" themeColor="mutedForeground" style={styles.heroBody}>
              An adaptive learning companion that reads a child&apos;s hesitation, frustration, and
              excitement the way a good camp counselor would — and changes how it teaches in real
              time.
            </ThemedText>
            <PrimaryButton
              label="Start a lesson"
              onPress={() => router.push('/lesson')}
              style={styles.ctaButton}
              accessibilityHint="Opens a short adaptive practice lesson"
            />
          </View>

          <View style={styles.pillars}>
            {PILLARS.map((pillar) => (
              <StickerCard
                key={pillar.title}
                title={pillar.title}
                icon={pillar.icon}
                iconBackground={pillar.iconBackground}
                style={styles.pillarCard}>
                <ThemedText type="body" themeColor="mutedForeground">
                  {pillar.body}
                </ThemedText>
              </StickerCard>
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.five,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  heroCircle: {
    position: 'absolute',
    top: -Spacing.four,
    opacity: 0.5,
  },
  heroTitle: {
    textAlign: 'center',
  },
  squiggle: {
    marginTop: -Spacing.two,
  },
  heroBody: {
    textAlign: 'center',
    maxWidth: 440,
  },
  ctaButton: {
    marginTop: Spacing.two,
    alignSelf: 'center',
  },
  pillars: {
    gap: Spacing.five,
    width: '100%',
  },
  pillarCard: {
    marginTop: Spacing.three,
    width: '100%',
  },
});
