import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  errorText?: string;
}

/**
 * White, 2px-bordered field. On focus the border switches to accent and
 * a hard shadow appears underneath — the same pop-shadow language as
 * buttons and cards, just reserved for the active field only.
 */
export function Input({ label, errorText, style, onFocus, onBlur, ...rest }: InputProps) {
  const theme = useTheme();
  const focusProgress = useSharedValue(0);

  const animatedWrapStyle = useAnimatedStyle(() => ({
    borderColor: focusProgress.value > 0.5 ? theme.colors.accent : theme.colors.foreground,
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
  }));

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated SharedValues are intentionally mutable outside React's state model; `.value =` is the sanctioned way to drive a UI-thread animation from a JS-thread event.
    focusProgress.value = withTiming(1, { duration: theme.reducedMotion ? 0 : 140 });
    onFocus?.(e);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    // eslint-disable-next-line react-hooks/immutability -- see handleFocus above.
    focusProgress.value = withTiming(0, { duration: theme.reducedMotion ? 0 : 140 });
    onBlur?.(e);
  };

  return (
    <View>
      {label ? (
        <Text
          style={{
            fontFamily: theme.fontFamily.bodyBold,
            fontSize: theme.fontSize.xs,
            color: theme.colors.mutedForeground,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: theme.space[2],
          }}
        >
          {label}
        </Text>
      ) : null}
      <View style={styles.shadowWrap}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shadowBlock,
            animatedShadowStyle,
            { backgroundColor: theme.colors.accent, borderRadius: theme.radius.sm, top: theme.hardShadow.rest, left: theme.hardShadow.rest },
          ]}
        />
        <Animated.View
          style={[
            animatedWrapStyle,
            {
              borderWidth: theme.borderWidth.chunky,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.input,
            },
          ]}
        >
          <TextInput
            {...rest}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={theme.colors.mutedForeground}
            style={[
              {
                minHeight: theme.minTapTarget,
                paddingHorizontal: theme.space[4],
                fontFamily: theme.fontFamily.bodyMedium,
                fontSize: theme.fontSize.base,
                color: theme.colors.foreground,
              },
              style,
            ]}
          />
        </Animated.View>
      </View>
      {errorText ? (
        <Text
          style={{
            fontFamily: theme.fontFamily.bodyMedium,
            fontSize: theme.fontSize.sm,
            color: theme.colors.danger,
            marginTop: theme.space[1],
          }}
        >
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: { position: 'relative' },
  shadowBlock: { position: 'absolute', right: 0, bottom: 0, left: 0, top: 0 },
});
