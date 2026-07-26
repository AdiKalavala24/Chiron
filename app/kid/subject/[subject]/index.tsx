import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { IconBadge, PillChip } from '@/components/ui';
import { PathMap } from '@/components/path';
import { getSortedNodes, type Subject } from '@/features/curriculum';
import { useProfileStore } from '@/stores/profile-store';
import { useSessionStore } from '@/stores/session-store';

const SUBJECT_LABEL: Record<Subject, string> = { reading: 'Reading', writing: 'Writing', math: 'Math', speaking: 'Speaking' };

export default function SkillPathScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ subject: string }>();
  const subject = params.subject as Subject;
  const child = useProfileStore((s) => s.getActiveChild());
  const logEvent = useSessionStore((s) => s.logEvent);
  const grade = child?.grade ?? 'K';
  const nodes = getSortedNodes(grade, subject);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.space[5], paddingTop: theme.space[3] }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <IconBadge size={44} backgroundColor={theme.colors.card} icon={<ArrowLeft size={20} color={theme.colors.foreground} strokeWidth={2.5} />} />
        </Pressable>
        <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>
          {SUBJECT_LABEL[subject] ?? subject}
        </Text>
        <PillChip label={`Grade ${grade}`} />
      </View>

      {nodes.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.space[8] }}>
          <Text style={{ fontFamily: theme.fontFamily.bodyMedium, color: theme.colors.mutedForeground, textAlign: 'center' }}>
            No path found for this grade and subject yet.
          </Text>
        </View>
      ) : (
        <PathMap
          grade={grade}
          subject={subject}
          nodes={nodes}
          onSelectNode={(node) => {
            if (child) {
              logEvent({ childId: child.id, grade, subject, nodeId: node.id, type: 'node_started', detail: { nodeTitle: node.title } });
            }
            router.push({ pathname: '/kid/subject/[subject]/node/[nodeId]', params: { subject, nodeId: node.id } });
          }}
        />
      )}
    </SafeAreaView>
  );
}
