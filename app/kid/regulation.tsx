import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { RegulationActivity } from '@/components/learning';
import { pickRegulationScript } from '@/features/adaptive';
import type { GradeBand, Subject } from '@/features/curriculum';
import { useProfileStore } from '@/stores/profile-store';
import { useSessionStore } from '@/stores/session-store';

/**
 * Presented as its own screen (pushed from the node player) rather than
 * an inline block, since regulation is triggered by the Adaptive
 * Controller across any subject/node, not authored into a specific one.
 * The triggering grade/subject/node are passed through as params so the
 * activity log attributes the break to where it actually happened.
 */
export default function RegulationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ grade: string; subject: string; nodeId: string }>();
  const [script] = useState(() => pickRegulationScript());
  const child = useProfileStore((s) => s.getActiveChild());
  const logEvent = useSessionStore((s) => s.logEvent);

  const grade = (params.grade as GradeBand) ?? child?.grade ?? 'K';
  const subject = (params.subject as Subject) ?? 'reading';
  const nodeId = params.nodeId ?? 'unknown';

  const handleComplete = () => {
    if (child) {
      logEvent({
        childId: child.id,
        grade,
        subject,
        nodeId,
        type: 'regulation_completed',
        detail: { activity: script.activity },
      });
    }
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        <RegulationActivity payload={script} onComplete={handleComplete} />
      </View>
    </SafeAreaView>
  );
}
