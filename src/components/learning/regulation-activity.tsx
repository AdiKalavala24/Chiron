import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Wind, Sparkles, Zap } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { CandyButton, IconBadge } from '@/components/ui';
import type { RegulationPayload } from '@/features/curriculum';

interface RegulationActivityProps {
  payload: RegulationPayload;
  onComplete: () => void;
}

const ACTIVITY_ICON: Record<RegulationPayload['activity'], React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  breathing: Wind,
  movement: Zap,
  silly_simon: Sparkles,
};

/**
 * Runs through the script one line at a time, paced evenly across
 * `durationSeconds`, with a gentle pulse for breathing activities. Always
 * skippable — a reset break should never feel like a trap.
 */
export function RegulationActivity({ payload, onComplete }: RegulationActivityProps) {
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const scale = useSharedValue(1);
  const Icon = ACTIVITY_ICON[payload.activity];

  useEffect(() => {
    if (payload.activity === 'breathing') {
      scale.value = withRepeat(withSequence(withTiming(1.35, { duration: 2200 }), withTiming(1, { duration: 2200 })), -1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.activity]);

  useEffect(() => {
    const stepDurationMs = Math.max(1200, (payload.durationSeconds * 1000) / payload.script.length);
    const timer = setTimeout(() => {
      setStepIndex((current) => {
        if (current + 1 >= payload.script.length) {
          onComplete();
          return current;
        }
        return current + 1;
      });
    }, stepDurationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.space[8] }}>
      {payload.activity === 'breathing' ? (
        <Animated.View
          style={[
            circleStyle,
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.colors.quaternary,
              borderWidth: theme.borderWidth.chunky,
              borderColor: theme.colors.foreground,
              marginBottom: theme.space[6],
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Icon size={36} color={theme.colors.foreground} strokeWidth={2} />
        </Animated.View>
      ) : (
        <IconBadge size={100} backgroundColor={theme.colors.tertiary} icon={<Icon size={40} color={theme.colors.foreground} strokeWidth={2} />} style={{ marginBottom: theme.space[6] }} />
      )}

      <Text
        style={{
          fontFamily: theme.fontFamily.headingBold,
          fontSize: theme.fontSize.xl,
          color: theme.colors.foreground,
          textAlign: 'center',
        }}
      >
        {payload.script[stepIndex]}
      </Text>

      <View style={{ marginTop: theme.space[8] }}>
        <CandyButton label="Skip" onPress={onComplete} variant="secondary" showArrow={false} />
      </View>
    </View>
  );
}
