import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface HardShadowProps {
  children: React.ReactNode;
  /** Shadow offset in px. Defaults to theme.hardShadow.rest (4). */
  offset?: number;
  /** Shadow block color. Defaults to foreground (slate). Featured cards may pass border or an accent. */
  shadowColor?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The Playful Geometric "pop shadow": a solid block offset behind the
 * content, not a native shadow. Native `shadowRadius` never renders a
 * crisp hard edge cross-platform (and Android needs `elevation`, which is
 * always soft), so every hard-shadow surface in the app should render
 * through this primitive instead of the `shadow*` style props.
 */
export function HardShadow({ children, offset, shadowColor, radius, style, contentStyle, testID }: HardShadowProps) {
  const theme = useTheme();
  const resolvedOffset = offset ?? theme.hardShadow.rest;
  const resolvedColor = shadowColor ?? theme.colors.foreground;
  const resolvedRadius = radius ?? theme.radius.md;

  return (
    <View style={[{ paddingRight: resolvedOffset, paddingBottom: resolvedOffset }, style]} testID={testID}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: resolvedOffset,
          left: resolvedOffset,
          right: 0,
          bottom: 0,
          backgroundColor: resolvedColor,
          borderRadius: resolvedRadius,
        }}
      />
      <View style={[{ borderRadius: resolvedRadius }, contentStyle]}>{children}</View>
    </View>
  );
}
