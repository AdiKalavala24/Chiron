/**
 * Design tokens for the "Playful Geometric" design system.
 *
 * This is the single source of truth for color, type, radius, spacing, and
 * shadow values. Components should always read from here rather than
 * hardcoding hex values or magic numbers, so the whole app can be re-themed
 * (or re-skinned per child, see `@/adaptive`) from one place.
 *
 * Reference: Memphis-Group-inspired "Stable Grid, Wild Decoration" system —
 * hard offset shadows (no blur), chunky 2px borders, pill buttons, and a
 * punchy but accessible color palette.
 */

import { Platform } from 'react-native';

import '@/global.css';

export const Colors = {
  light: {
    background: '#FFFDF5', // Warm cream / paper feel
    foreground: '#1E293B', // Slate 800
    muted: '#F1F5F9', // Slate 100
    mutedForeground: '#64748B', // Slate 500
    accent: '#8B5CF6', // Vivid violet (primary brand)
    accentForeground: '#FFFFFF',
    secondary: '#F472B6', // Hot pink
    tertiary: '#FBBF24', // Amber / yellow
    quaternary: '#34D399', // Emerald / mint
    border: '#E2E8F0', // Slate 200 — soft dividers
    borderStrong: '#CBD5E1', // Slate 300 — input resting border
    input: '#FFFFFF',
    card: '#FFFFFF',
    ring: '#8B5CF6',
    /** Color used for the flat "pop" shadow. Matches foreground in light mode. */
    shadow: '#1E293B',
  },
  dark: {
    background: '#15131E',
    foreground: '#F1F5F9',
    muted: '#232130',
    mutedForeground: '#94A3B8',
    accent: '#A78BFA', // Violet 400 — lighter for contrast on a dark surface
    accentForeground: '#1E1B2E',
    secondary: '#F9A8D4', // Pink 300
    tertiary: '#FCD34D', // Amber 300
    quaternary: '#6EE7B7', // Emerald 300
    border: '#3A3750',
    borderStrong: '#4B4863',
    input: '#232130',
    card: '#1E1C29',
    ring: '#A78BFA',
    /** Shadows read as "carved" black on dark surfaces rather than slate. */
    shadow: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Rotating "confetti" accent colors — used for decorative shapes, feature
 * card headers, badges, and anything that should NOT always be the same
 * color. Cycle through these rather than repeating one accent everywhere.
 */
export const ConfettiColors = ['secondary', 'tertiary', 'quaternary'] as const satisfies readonly ThemeColor[];

export const Fonts = Platform.select({
  web: {
    heading: 'Outfit, system-ui, sans-serif',
    body: '"Plus Jakarta Sans", system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  default: {
    heading: 'Outfit',
    body: 'PlusJakartaSans',
    mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
  },
})!;

/** Font family + weight pairs, matched to the exact files loaded in use-app-fonts.ts. */
export const FontWeights = {
  headingBold: Platform.OS === 'web' ? { fontFamily: Fonts.heading, fontWeight: '700' as const } : { fontFamily: 'Outfit_700Bold' },
  headingExtraBold: Platform.OS === 'web' ? { fontFamily: Fonts.heading, fontWeight: '800' as const } : { fontFamily: 'Outfit_800ExtraBold' },
  bodyRegular: Platform.OS === 'web' ? { fontFamily: Fonts.body, fontWeight: '400' as const } : { fontFamily: 'PlusJakartaSans_400Regular' },
  bodyMedium: Platform.OS === 'web' ? { fontFamily: Fonts.body, fontWeight: '500' as const } : { fontFamily: 'PlusJakartaSans_500Medium' },
  bodyBold: Platform.OS === 'web' ? { fontFamily: Fonts.body, fontWeight: '700' as const } : { fontFamily: 'PlusJakartaSans_700Bold' },
};

/** Type scale — 1.25 (major third) ratio off a 16px base. */
export const Type = {
  xs: { fontSize: 13, lineHeight: 18 },
  sm: { fontSize: 16, lineHeight: 22 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 20, lineHeight: 28 },
  xl: { fontSize: 25, lineHeight: 32 },
  '2xl': { fontSize: 31, lineHeight: 38 },
  '3xl': { fontSize: 39, lineHeight: 44 },
  '4xl': { fontSize: 49, lineHeight: 54 },
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

export const BorderWidth = {
  default: 2,
} as const;

/**
 * Offsets for the flat "pop" shadow (no blur, hard offset). Pair with
 * `Colors[theme].shadow` (or an explicit color, e.g. accent for input focus).
 * Values match the design spec: rest 4/4, hover/lift 6/6, press 2/2.
 */
export const ShadowOffset = {
  rest: 4,
  lift: 6,
  press: 2,
  card: 8,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Bouncy/elastic timing used for hover, press, and entrance animations. */
export const Motion = {
  springConfig: { damping: 12, stiffness: 220, mass: 0.6 },
  durationMs: 300,
} as const;
