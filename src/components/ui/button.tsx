import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { popShadow } from '@/components/ui/pop-shadow';
import { BorderWidth, Motion, Radius, ShadowOffset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InteractionState = 'rest' | 'hover' | 'press';

const shadowOffsetFor: Record<InteractionState, number> = {
  rest: ShadowOffset.rest,
  hover: ShadowOffset.lift,
  press: ShadowOffset.press,
};

/** -2/-2 on hover ("lift"), +2/+2 on press ("push in"), per the design spec. */
const translateFor: Record<InteractionState, number> = { rest: 0, hover: -2, press: 2 };

function useInteractionState() {
  const [state, setState] = useState<InteractionState>('rest');
  return {
    state,
    handlers: {
      onHoverIn: () => setState((s) => (s === 'press' ? s : 'hover')),
      onHoverOut: () => setState('rest'),
      onPressIn: () => setState('press'),
      onPressOut: () => setState((s) => (s === 'press' ? 'rest' : s)),
    },
  };
}

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  /** Shows the circular arrow-right glyph used by the "Candy Button" spec. Default true. */
  showIcon?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

/** The "Candy Button": pill, accent fill, dark ink border, hard shadow, bouncy press. */
export function PrimaryButton({
  label,
  onPress,
  showIcon = true,
  disabled,
  style,
  accessibilityHint,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { state, handlers } = useInteractionState();
  const translate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translate.value },
      { translateY: translate.value },
    ],
  }));

  const shadow = useMemo(
    () => popShadow(shadowOffsetFor[state], theme.shadow),
    [state, theme.shadow],
  );

  useEffect(() => {
    translate.value = reducedMotion
      ? translateFor[state]
      : withSpring(translateFor[state], Motion.springConfig);
  }, [state, reducedMotion, translate]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.();
        }}
        {...handlers}
        style={[
          styles.base,
          shadow,
          {
            backgroundColor: theme.accent,
            borderColor: theme.foreground,
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        <ThemedText type="bodyLg" themeColor="accentForeground" style={styles.label}>
          {label}
        </ThemedText>
        {showIcon && (
          <View style={[styles.iconCircle, { backgroundColor: theme.accentForeground }]}>
            <ArrowRight size={16} color={theme.accent} strokeWidth={2.5} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

type SecondaryButtonProps = Omit<PrimaryButtonProps, 'showIcon'>;

/** Outline button that fills with the tertiary yellow on hover/press. */
export function SecondaryButton({ label, onPress, disabled, style, accessibilityHint }: SecondaryButtonProps) {
  const theme = useTheme();
  const { state, handlers } = useInteractionState();
  const filled = state !== 'rest';

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        onPress?.();
      }}
      {...handlers}
      style={[
        styles.base,
        styles.secondaryBase,
        {
          borderColor: theme.foreground,
          backgroundColor: filled ? theme.tertiary : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      <ThemedText type="bodyLg" themeColor="foreground" style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.full,
    borderWidth: BorderWidth.default,
    minHeight: 48,
    alignSelf: 'flex-start',
  },
  secondaryBase: {
    paddingVertical: Spacing.two,
  },
  label: {
    textAlign: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
