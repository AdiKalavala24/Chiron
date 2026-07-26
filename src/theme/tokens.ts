/**
 * Chiron design tokens — "Playful Geometric" system.
 * Stable Grid, Wild Decoration: content stays readable, the surrounding
 * chrome is a sticker-book of hard shadows and Memphis-style shapes.
 *
 * This is the single source of truth for color, shape, type, and shadow.
 * Components should read from `useTheme()` rather than importing this
 * module directly, so the token set can grow (e.g. seasonal skins)
 * without touching every screen.
 */

export const colors = {
  background: '#FFFDF5',
  foreground: '#1E293B',
  muted: '#F1F5F9',
  mutedForeground: '#64748B',
  accent: '#8B5CF6',
  accentForeground: '#FFFFFF',
  secondary: '#F472B6',
  secondaryForeground: '#FFFFFF',
  tertiary: '#FBBF24',
  tertiaryForeground: '#1E293B',
  quaternary: '#34D399',
  quaternaryForeground: '#1E293B',
  border: '#E2E8F0',
  card: '#FFFFFF',
  input: '#FFFFFF',
  ring: '#8B5CF6',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F43F5E',
} as const;

/** The four rotating "accent" colors used for cards/badges cycling through a grid. */
export const accentCycle = [colors.accent, colors.secondary, colors.tertiary, colors.quaternary] as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  chunky: 2,
  thick: 3,
} as const;

/**
 * Hard pop-shadow offsets (no blur). Rendered via the <HardShadow> primitive
 * as a solid offset block behind content, not a native shadow — native
 * shadowRadius never renders a crisp edge cross-platform.
 */
export const hardShadow = {
  rest: 4,
  lift: 6,
  pressed: 2,
} as const;

export const fontFamily = {
  headingExtraBold: 'Outfit_800ExtraBold',
  headingBold: 'Outfit_700Bold',
  headingSemiBold: 'Outfit_600SemiBold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

/** Major-third (1.25) type scale, rounded to clean pixel values. */
export const fontSize = {
  xs: 10,
  sm: 13,
  base: 16,
  lg: 20,
  xl: 25,
  '2xl': 31,
  '3xl': 39,
  '4xl': 49,
  '5xl': 61,
} as const;

export const lineHeight = {
  xs: 14,
  sm: 18,
  base: 22,
  lg: 26,
  xl: 32,
  '2xl': 38,
  '3xl': 46,
  '4xl': 56,
  '5xl': 68,
} as const;

/** 4px-based spacing scale. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/** Lucide icon stroke width — icons always sit inside a colored circle, never floating alone. */
export const iconStrokeWidth = 2.5;

export const minTapTarget = 48;

export const tokens = {
  colors,
  accentCycle,
  radius,
  borderWidth,
  hardShadow,
  fontFamily,
  fontSize,
  lineHeight,
  space,
  iconStrokeWidth,
  minTapTarget,
} as const;

export type Tokens = typeof tokens;
