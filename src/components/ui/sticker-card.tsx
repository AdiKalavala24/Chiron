import React, { useEffect } from 'react';
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { HardShadow } from './hard-shadow';

interface StickerCardProps {
  title?: string;
  subtitle?: string;
  /** Header strip + shadow color when selected. Defaults to theme.colors.accent. */
  accentColor?: string;
  /** Typically an <IconBadge> positioned to float half over the top border. */
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The workhorse card: grade tiles, subject tiles, question cards. A
 * colored header strip plus an optional floating icon badge that
 * straddles the top border. Selecting it lifts the shadow to the accent
 * color and gives a quick wiggle.
 */
export function StickerCard({
  title,
  subtitle,
  accentColor,
  icon,
  selected,
  disabled,
  onPress,
  children,
  style,
  contentStyle,
  testID,
}: StickerCardProps) {
  const theme = useTheme();
  const fill = accentColor ?? theme.colors.accent;
  const wiggle = useSharedValue(0);

  useEffect(() => {
    if (selected && !theme.reducedMotion) {
      wiggle.value = withSequence(
        withTiming(-3, { duration: 70 }),
        withTiming(3, { duration: 90 }),
        withTiming(0, { duration: 70 }),
      );
    }
  }, [selected, theme.reducedMotion, wiggle]);

  const wiggleStyle = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${wiggle.value}deg` }] }));

  const card = (
    <HardShadow
      offset={selected ? theme.hardShadow.lift : theme.hardShadow.rest}
      shadowColor={selected ? fill : theme.colors.foreground}
      radius={theme.radius.lg}
    >
      <View
        style={[
          styles.card,
          {
            borderColor: theme.colors.foreground,
            borderWidth: theme.borderWidth.chunky,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.card,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View style={[styles.headerStrip, { backgroundColor: fill, borderTopLeftRadius: theme.radius.lg - 2, borderTopRightRadius: theme.radius.lg - 2 }]} />
        <View style={[styles.body, { padding: theme.space[4] }, contentStyle]}>
          {title ? (
            <Text style={{ fontFamily: theme.fontFamily.headingBold, fontSize: theme.fontSize.lg, color: theme.colors.foreground }}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              style={{
                fontFamily: theme.fontFamily.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.mutedForeground,
                marginTop: theme.space[1],
              }}
            >
              {subtitle}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    </HardShadow>
  );

  return (
    <Animated.View style={[wiggleStyle, style]}>
      {onPress ? (
        <Pressable
          onPress={disabled ? undefined : onPress}
          disabled={disabled}
          testID={testID}
          accessibilityRole="button"
          accessibilityState={{ selected: !!selected, disabled: !!disabled }}
          style={styles.pressable}
        >
          {card}
          {icon ? <View style={styles.iconFloat}>{icon}</View> : null}
        </Pressable>
      ) : (
        <View style={styles.pressable} testID={testID}>
          {card}
          {icon ? <View style={styles.iconFloat}>{icon}</View> : null}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: { position: 'relative' },
  card: { overflow: 'hidden' },
  headerStrip: { height: 10, width: '100%' },
  body: { flexShrink: 1 },
  iconFloat: { position: 'absolute', top: -20, left: 18, zIndex: 2 },
});
