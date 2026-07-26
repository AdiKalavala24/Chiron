import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/theme';
import type { GradeBand, PathNode, Subject } from '@/features/curriculum';
import { useProgressStore } from '@/stores/progress-store';
import { PathNodeView } from './path-node-view';
import { ProgressPipe } from './progress-pipe';

interface PathMapProps {
  grade: GradeBand;
  subject: Subject;
  nodes: PathNode[];
  onSelectNode: (node: PathNode) => void;
}

export function PathMap({ grade, subject, nodes, onSelectNode }: PathMapProps) {
  const theme = useTheme();
  const getNodeState = useProgressStore((s) => s.getNodeState);
  const scrollRef = useRef<ScrollView>(null);
  const [hasScrolledToCurrent, setHasScrolledToCurrent] = useState(false);
  const currentNodeId = useProgressStore((s) => s.getCurrentNodeId(grade, subject));

  const handleCurrentNodeLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (hasScrolledToCurrent) return;
      const { y, height } = event.nativeEvent.layout;
      setHasScrolledToCurrent(true);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - height), animated: true });
      });
    },
    [hasScrolledToCurrent],
  );

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ alignItems: 'center', paddingVertical: theme.space[6] }} showsVerticalScrollIndicator={false}>
      {nodes.map((node, index) => {
        const state = getNodeState(grade, subject, node.id);
        return (
          <View key={node.id} style={{ alignItems: 'center' }} onLayout={node.id === currentNodeId ? handleCurrentNodeLayout : undefined}>
            <PathNodeView title={node.title} state={state} onPress={() => onSelectNode(node)} />
            {index < nodes.length - 1 ? (
              <View style={{ marginVertical: theme.space[1] }}>
                <ProgressPipe filled={state === 'completed' || state === 'mastered'} />
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
