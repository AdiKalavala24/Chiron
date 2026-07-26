import React from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle as SvgCircle, Polygon, Rect, Path } from 'react-native-svg';
import { useTheme } from '@/theme';

interface ShapeProps {
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  style?: StyleProp<ViewStyle>;
}

/** Decorative Memphis-style shapes. Purely ornamental — always `pointerEvents="none"` at the call site. */

export function DecorCircle({ size = 24, color, opacity = 1, rotation = 0, style }: ShapeProps) {
  const theme = useTheme();
  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <SvgCircle cx={12} cy={12} r={11} fill={color ?? theme.colors.tertiary} opacity={opacity} />
      </Svg>
    </View>
  );
}

export function DecorTriangle({ size = 24, color, opacity = 1, rotation = 0, style }: ShapeProps) {
  const theme = useTheme();
  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Polygon points="12,2 22,21 2,21" fill={color ?? theme.colors.secondary} opacity={opacity} />
      </Svg>
    </View>
  );
}

export function DecorSquare({ size = 24, color, opacity = 1, rotation = 12, style }: ShapeProps) {
  const theme = useTheme();
  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={3} y={3} width={18} height={18} rx={3} fill={color ?? theme.colors.quaternary} opacity={opacity} />
      </Svg>
    </View>
  );
}

export function DecorSquiggle({ size = 32, color, opacity = 1, rotation = 0, style }: ShapeProps) {
  const theme = useTheme();
  return (
    <View style={[{ width: size, height: size * 0.5, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size * 0.5} viewBox="0 0 32 16">
        <Path
          d="M1 8 C 5 1, 9 15, 13 8 S 21 1, 25 8 S 30 13, 31 8"
          stroke={color ?? theme.colors.accent}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={opacity}
        />
      </Svg>
    </View>
  );
}

type ConfettiPiece = {
  kind: 'circle' | 'triangle' | 'square';
  top: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  size: number;
  color: 'accent' | 'secondary' | 'tertiary' | 'quaternary';
  rotation: number;
  opacity: number;
};

/** Fixed, deterministic scatter so decoration never shifts between re-renders. */
const DEFAULT_SCATTER: ConfettiPiece[] = [
  { kind: 'circle', top: '4%', left: '82%', size: 40, color: 'tertiary', rotation: 0, opacity: 0.9 },
  { kind: 'triangle', top: '14%', left: '6%', size: 26, color: 'secondary', rotation: 12, opacity: 0.85 },
  { kind: 'square', top: '68%', right: '10%', size: 22, color: 'quaternary', rotation: 20, opacity: 0.8 },
  { kind: 'circle', top: '78%', left: '14%', size: 18, color: 'accent', rotation: 0, opacity: 0.7 },
  { kind: 'triangle', top: '46%', right: '4%', size: 20, color: 'tertiary', rotation: -10, opacity: 0.6 },
];

/**
 * Absolutely-fills its parent with a handful of scattered confetti shapes.
 * Parent must be `position: relative` (or the default) and sized; render
 * this first so real content stacks above it.
 */
export function ConfettiField({ pieces = DEFAULT_SCATTER, style }: { pieces?: ConfettiPiece[]; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const colorFor = (c: ConfettiPiece['color']) => theme.colors[c];

  return (
    <View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, style]}>
      {pieces.map((p, i) => {
        const positionStyle: ViewStyle = {
          position: 'absolute',
          top: p.top,
          ...(p.left !== undefined ? { left: p.left } : {}),
          ...(p.right !== undefined ? { right: p.right } : {}),
        };
        const Shape = p.kind === 'circle' ? DecorCircle : p.kind === 'triangle' ? DecorTriangle : DecorSquare;
        return (
          <Shape
            key={i}
            size={p.size}
            color={colorFor(p.color)}
            rotation={p.rotation}
            opacity={p.opacity}
            style={positionStyle}
          />
        );
      })}
    </View>
  );
}
