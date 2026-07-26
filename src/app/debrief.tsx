import { CircleCheckBig, CircleX, MessageCircleHeart } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { generateDebrief, useEngagement } from '@/adaptive';
import { ThemedText } from '@/components/themed-text';
import { SecondaryButton } from '@/components/ui/button';
import { StickerCard } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function DebriefScreen() {
  const theme = useTheme();
  const { history, reset } = useEngagement();
  const narrative = generateDebrief(history);
  const correctCount = history.filter((e) => e.correct).length;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ThemedText type="h1">Today with Chiron</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground">
            The kind of update a counselor gives at pickup — not a progress bar.
          </ThemedText>

          <StickerCard
            title="The debrief"
            icon={<MessageCircleHeart size={20} color="#FFFFFF" strokeWidth={2.5} />}
            iconBackground="secondary"
            variant="featured"
            style={styles.debriefCard}>
            <ThemedText type="bodyLg">{narrative}</ThemedText>
          </StickerCard>

          {history.length > 0 && (
            <View style={styles.tally}>
              <ThemedText type="label" themeColor="mutedForeground">
                This session
              </ThemedText>
              {history.map((event, i) => (
                <View key={i} style={styles.tallyRow}>
                  {event.correct ? (
                    <CircleCheckBig size={18} color={theme.quaternary} strokeWidth={2.5} />
                  ) : (
                    <CircleX size={18} color={theme.secondary} strokeWidth={2.5} />
                  )}
                  <ThemedText type="body">{event.questionLabel ?? 'Question'}</ThemedText>
                  <ThemedText type="bodySm" themeColor="mutedForeground">
                    {Math.round(event.responseTimeMs / 100) / 10}s
                  </ThemedText>
                </View>
              ))}
              <ThemedText type="bodySm" themeColor="mutedForeground" style={styles.tallySummary}>
                {correctCount} of {history.length} correct
              </ThemedText>
            </View>
          )}

          {history.length > 0 && (
            <SecondaryButton label="Start a new session" onPress={reset} style={styles.resetButton} />
          )}
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.two,
  },
  debriefCard: {
    marginTop: Spacing.four,
  },
  tally: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  tallyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tallySummary: {
    marginTop: Spacing.one,
  },
  resetButton: {
    alignSelf: 'center',
    marginTop: Spacing.four,
  },
});
