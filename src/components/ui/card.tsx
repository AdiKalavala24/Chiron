import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { popShadow } from '@/components/ui/pop-shadow';
import { BorderWidth, Motion, Radius, ShadowOffset, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StickerCardProps = {
  title?: string;
  children?: ReactNode;
  /** Floating icon that sits half-in/half-out of the top border, per the "Sticker" spec. */
  icon?: ReactNode;
  iconBackground?: ThemeColor;
  /** Featured cards get a pink shadow instead of the neutral one. */
  variant?: 'default' | 'featured';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function StickerCard({
  title,
  children,
  icon,
  iconBackground = 'accent',
  variant = 'default',
  onPress,
  style,
}: StickerCardProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const wiggle = useSharedValue(0); // 0 rest, 1 wiggled

  useEffect(() => {
    wiggle.value = reducedMotion ? (pressed ? 1 : 0) : withSpring(pressed ? 1 : 0, Motion.springConfig);
  }, [pressed, reducedMotion, wiggle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${wiggle.value * -1}deg` },
      { scale: 1 + wiggle.value * 0.02 },
    ],
  }));

  const shadowColor = variant === 'featured' ? theme.secondary : theme.border;
  const content = (
    <Animated.View
      style={[
        animatedStyle,
        styles.card,
        popShadow(ShadowOffset.card, shadowColor),
        { backgroundColor: theme.card, borderColor: theme.foreground },
        style,
      ]}>
      {icon && (
        <View style={[styles.iconBadge, { backgroundColor: theme[iconBackground], borderColor: theme.foreground }]}>
          {icon}
        </View>
      )}
      {title && (
        <ThemedText type="h3" style={icon ? styles.titleWithIcon : undefined}>
          {title}
        </ThemedText>
      )}
      {children}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: BorderWidth.default,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  iconBadge: {
    position: 'absolute',
    top: -Spacing.four,
    left: Spacing.four,
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    borderWidth: BorderWidth.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWithIcon: {
    marginTop: Spacing.four,
  },
});
