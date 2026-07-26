import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderWidth, Radius, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BadgeProps = {
  label: string;
  color?: ThemeColor;
  style?: StyleProp<ViewStyle>;
};

/** Small "confetti" pill — rotate `color` through secondary/tertiary/quaternary rather than reusing one hue everywhere. */
export function Badge({ label, color = 'tertiary', style }: BadgeProps) {
  const theme = useTheme();
  return (
    <View
      style={[styles.badge, { backgroundColor: theme[color], borderColor: theme.foreground }, style]}>
      <ThemedText type="label" themeColor="foreground">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: BorderWidth.default,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
