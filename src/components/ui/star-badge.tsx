import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useTheme } from '@/theme';

interface StarBadgeProps {
  label: string;
  color?: string;
  size?: number;
  rotation?: number;
  style?: StyleProp<ViewStyle>;
}

function starburstPoints(cx: number, cy: number, outerR: number, innerR: number, spikes: number): string {
  const points: string[] = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(' ');
}

/**
 * The rotated starburst badge used for "MOST HELPFUL TIP" on the top
 * parent-guidance card. Absolutely position this from the call site
 * (e.g. top: -16, right: -12) over the corner of a StickerCard.
 */
export function StarBadge({ label, color, size = 96, rotation = -15, style }: StarBadgeProps) {
  const theme = useTheme();
  const fill = color ?? theme.colors.tertiary;
  const points = starburstPoints(size / 2, size / 2, size / 2 - 2, size / 2 - 10, 10);

  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        <Polygon points={points} fill={fill} stroke={theme.colors.foreground} strokeWidth={2} strokeLinejoin="round" />
      </Svg>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: size * 0.16 }}>
        <Text
          style={{
            fontFamily: theme.fontFamily.headingBold,
            fontSize: theme.fontSize.xs,
            lineHeight: theme.fontSize.xs + 2,
            color: theme.colors.foreground,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
