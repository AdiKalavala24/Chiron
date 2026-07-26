import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Check, Lock, Sparkles, Star } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { HardShadow } from '@/components/ui';
import type { NodeState } from '@/features/curriculum';

interface PathNodeViewProps {
  title: string;
  state: NodeState;
  onPress?: () => void;
}

const SIZE = 68;

export function PathNodeView({ title, state, onPress }: PathNodeViewProps) {
  const theme = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state === 'current' && !theme.reducedMotion) {
      pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
    } else {
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [state, theme.reducedMotion, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const isLocked = state === 'locked';
  const backgroundColor =
    state === 'mastered' || state === 'completed' ? theme.colors.quaternary : state === 'current' ? theme.colors.accent : theme.colors.muted;
  const iconColor = isLocked ? theme.colors.mutedForeground : state === 'current' ? theme.colors.accentForeground : theme.colors.foreground;

  const icon = isLocked ? (
    <Lock size={22} color={iconColor} strokeWidth={2.5} />
  ) : state === 'mastered' ? (
    <Star size={24} color={iconColor} strokeWidth={2.5} fill={iconColor} />
  ) : state === 'completed' ? (
    <Check size={24} color={iconColor} strokeWidth={3} />
  ) : (
    <Sparkles size={22} color={iconColor} strokeWidth={2.5} />
  );

  return (
    <View style={{ alignItems: 'center', width: 96 }}>
      <Animated.View style={pulseStyle}>
        <Pressable onPress={isLocked ? undefined : onPress} disabled={isLocked} accessibilityRole="button" accessibilityState={{ disabled: isLocked }} accessibilityLabel={title}>
          <HardShadow
            offset={state === 'current' ? theme.hardShadow.lift : theme.hardShadow.rest}
            shadowColor={state === 'mastered' ? theme.colors.tertiary : theme.colors.foreground}
            radius={SIZE / 2}
          >
            <View
              style={{
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
                borderWidth: theme.borderWidth.chunky,
                borderColor: state === 'mastered' ? theme.colors.tertiary : theme.colors.foreground,
                backgroundColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </View>
          </HardShadow>
        </Pressable>
      </Animated.View>
      <Text
        numberOfLines={2}
        style={{
          marginTop: theme.space[2],
          textAlign: 'center',
          fontFamily: theme.fontFamily.bodyBold,
          fontSize: theme.fontSize.xs,
          color: isLocked ? theme.colors.mutedForeground : theme.colors.foreground,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
