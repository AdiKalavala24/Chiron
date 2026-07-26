import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { popShadow } from '@/components/ui/pop-shadow';
import { BorderWidth, FontWeights, Radius, ShadowOffset, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

/** Bold uppercase label, chunky border, and a colored hard shadow that appears on focus. */
export function TextField({ label, error, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && (
        <ThemedText type="label" themeColor="mutedForeground">
          {label}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={theme.mutedForeground}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          focused ? popShadow(ShadowOffset.press, theme.accent) : undefined,
          {
            backgroundColor: theme.input,
            borderColor: focused ? theme.accent : theme.borderStrong,
            color: theme.foreground,
          },
          style,
        ]}
        {...rest}
      />
      {error && (
        <ThemedText type="bodySm" themeColor="secondary">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  input: {
    ...Type.base,
    ...FontWeights.bodyRegular,
    borderWidth: BorderWidth.default,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
});
