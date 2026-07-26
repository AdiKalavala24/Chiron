import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface IconBadgeProps {
  /** A pre-sized, pre-colored icon element, e.g. <Sparkles size={20} color="#fff" strokeWidth={2.5} />. */
  icon: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  /** Circle diameter. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Lucide icons never float alone in this design system — every icon sits
 * inside one of these colored circles with a chunky border.
 */
export function IconBadge({ icon, backgroundColor, borderColor, size = 40, style }: IconBadgeProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor ?? theme.colors.accent,
          borderWidth: theme.borderWidth.chunky,
          borderColor: borderColor ?? theme.colors.foreground,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {icon}
    </View>
  );
}
