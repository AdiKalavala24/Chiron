import React from 'react';
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { wiggleDegrees } from '@/theme/motion';

export type CandyButtonVariant = 'primary' | 'secondary';

interface CandyButtonProps {
  label: string;
  onPress?: () => void;
  variant?: CandyButtonVariant;
  disabled?: boolean;
  /** Fill color for primary; press-fill color for secondary. Defaults to theme.colors.accent / tertiary. */
  accentColor?: string;
  showArrow?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The primary call-to-action across Chiron: pill shape, dark chunky
 * border, hard shadow, and (for primary) a white circular arrow badge.
 * On press, content slides toward its fixed shadow block (4px -> 2px
 * gap) rather than the shadow resizing, and secondary buttons fill with
 * tertiary yellow.
 */
export function CandyButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  accentColor,
  showArrow = true,
  fullWidth,
  style,
  testID,
}: CandyButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const fill = accentColor ?? (isPrimary ? theme.colors.accent : theme.colors.tertiary);
  const pressTravel = theme.hardShadow.rest - theme.hardShadow.pressed;

  const pressProgress = useSharedValue(0);
  const iconWiggle = useSharedValue(0);
  const animsEnabled = !theme.reducedMotion;

  const handlePressIn = () => {
    pressProgress.value = withTiming(1, { duration: animsEnabled ? 100 : 0 });
    if (showArrow && animsEnabled) {
      iconWiggle.value = withSequence(
        withTiming(-wiggleDegrees, { duration: 60 }),
        withTiming(wiggleDegrees, { duration: 90 }),
        withTiming(0, { duration: 60 }),
      );
    }
  };

  const handlePressOut = () => {
    pressProgress.value = withTiming(0, { duration: animsEnabled ? 140 : 0 });
  };

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressProgress.value * pressTravel },
      { translateY: pressProgress.value * pressTravel },
      { scale: 1 - pressProgress.value * 0.03 },
    ],
    backgroundColor: isPrimary
      ? fill
      : interpolateColor(pressProgress.value, [0, 1], ['rgba(255,255,255,0)', fill]),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${iconWiggle.value}deg` }],
  }));

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
      style={[fullWidth ? styles.fullWidth : undefined, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View
        style={[
          styles.shadowWrap,
          { paddingRight: theme.hardShadow.rest, paddingBottom: theme.hardShadow.rest },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.shadowBlock,
            {
              top: theme.hardShadow.rest,
              left: theme.hardShadow.rest,
              backgroundColor: theme.colors.foreground,
              borderRadius: theme.radius.full,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.content,
            contentStyle,
            {
              borderRadius: theme.radius.full,
              borderWidth: theme.borderWidth.chunky,
              borderColor: theme.colors.foreground,
              paddingHorizontal: theme.space[6],
              minHeight: theme.minTapTarget,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: theme.fontFamily.bodyBold,
              fontSize: theme.fontSize.base,
              color: isPrimary ? theme.colors.accentForeground : theme.colors.foreground,
              letterSpacing: 0.2,
            }}
            numberOfLines={1}
          >
            {label}
          </Text>
          {showArrow ? (
            <Animated.View
              style={[
                iconStyle,
                {
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  marginLeft: theme.space[3],
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isPrimary ? 'rgba(255,255,255,0.25)' : theme.colors.foreground,
                },
              ]}
            >
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  shadowWrap: { position: 'relative' },
  shadowBlock: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
