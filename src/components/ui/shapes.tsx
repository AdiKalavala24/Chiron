import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Polygon, Rect } from 'react-native-svg';

import { ConfettiColors, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A plain decorative circle — the "massive circle behind the hero text" motif. */
export function CircleDecoration({
  size = 240,
  color = 'tertiary',
  style,
}: {
  size?: number;
  color?: ThemeColor;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme[color] },
        style,
      ]}
    />
  );
}

/** An organic asymmetric "blob" shape, for image masks and background decoration. */
export function Blob({
  size = 200,
  color = 'quaternary',
  style,
}: {
  size?: number;
  color?: ThemeColor;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={style}>
      <Path
        fill={theme[color]}
        d="M45,-58C58,-49,68,-34,72,-17C76,0,73,19,64,35C55,50,40,63,22,69C4,75,-17,73,-36,64C-55,55,-72,38,-77,18C-83,-3,-77,-27,-63,-44C-49,-61,-27,-71,-4,-68C19,-64,32,-67,45,-58Z"
        transform="translate(100 100)"
      />
    </Svg>
  );
}

/** A wavy divider line, used under headings or between sections. */
export function Squiggle({
  width = 120,
  color = 'accent',
  style,
}: {
  width?: number;
  color?: ThemeColor;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <Svg width={width} height={16} viewBox="0 0 400 24" style={style}>
      <Path
        d="M0,12 Q12.5,0 25,12 T50,12 T75,12 T100,12 T125,12 T150,12 T175,12 T200,12 T225,12 T250,12 T275,12 T300,12 T325,12 T350,12 T375,12 T400,12"
        stroke={theme[color]}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Tiled dot-grid background pattern, sized to fill its parent. */
export function DotGrid({ color = 'border', style }: { color?: ThemeColor; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <Svg width="100%" height="100%" style={[StyleSheet.absoluteFill, style]}>
      <Defs>
        <Pattern id="dotGrid" width={18} height={18} patternUnits="userSpaceOnUse">
          <Circle cx={2} cy={2} r={1.6} fill={theme[color]} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dotGrid)" />
    </Svg>
  );
}

type ConfettiPiece = { x: number; y: number; rotate: number; kind: 'circle' | 'triangle'; size: number };

const DEFAULT_LAYOUT: ConfettiPiece[] = [
  { x: 8, y: 12, rotate: 12, kind: 'circle', size: 10 },
  { x: 85, y: 8, rotate: -20, kind: 'triangle', size: 14 },
  { x: 15, y: 78, rotate: 30, kind: 'triangle', size: 12 },
  { x: 90, y: 70, rotate: 0, kind: 'circle', size: 8 },
  { x: 50, y: 92, rotate: -15, kind: 'circle', size: 10 },
  { x: 60, y: 15, rotate: 45, kind: 'triangle', size: 10 },
];

/**
 * Small triangles/circles scattered behind a content block, rotating through
 * the confetti colors. Meant to sit absolutely behind a card or section —
 * wrap it and your content together in a `position: 'relative'` parent.
 */
export function ConfettiField({
  pieces = DEFAULT_LAYOUT,
  style,
}: {
  pieces?: ConfettiPiece[];
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, styles.noEvents, style]} pointerEvents="none">
      {pieces.map((piece, i) => {
        const color = theme[ConfettiColors[i % ConfettiColors.length]];
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              transform: [{ rotate: `${piece.rotate}deg` }],
            }}>
            {piece.kind === 'circle' ? (
              <Svg width={piece.size} height={piece.size}>
                <Circle cx={piece.size / 2} cy={piece.size / 2} r={piece.size / 2} fill={color} />
              </Svg>
            ) : (
              <Svg width={piece.size} height={piece.size}>
                <Polygon
                  points={`${piece.size / 2},0 ${piece.size},${piece.size} 0,${piece.size}`}
                  fill={color}
                />
              </Svg>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  noEvents: {
    zIndex: -1,
  },
});
