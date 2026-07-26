import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { BorderWidth, Radius, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconBadgeProps = {
  icon: ReactElement;
  color?: ThemeColor;
  size?: number;
  bordered?: boolean;
};

/**
 * Per the iconography rule: "never floating alone" — every icon lives inside
 * a colored circle. Pass a Lucide icon element already sized/colored, or omit
 * its color to inherit the badge's contrast color.
 */
export function IconBadge({ icon, color = 'accent', size = 40, bordered = false }: IconBadgeProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme[color],
          borderColor: bordered ? theme.foreground : 'transparent',
          borderWidth: bordered ? BorderWidth.default : 0,
        },
      ]}>
      {icon}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
