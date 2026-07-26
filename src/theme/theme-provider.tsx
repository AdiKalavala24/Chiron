import React, { createContext, useContext, useMemo } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { tokens, type Tokens } from './tokens';

interface ThemeContextValue extends Tokens {
  /** True when the OS accessibility setting "Reduce Motion" is on. */
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ ...tokens, reducedMotion: false });

/**
 * Chiron ships one fixed "Playful Geometric" palette — there is no dark
 * mode in Phase 1. The context exists so screens never import token
 * values directly, keeping room to introduce seasonal or accessibility
 * skins later without touching call sites.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const value = useMemo<ThemeContextValue>(() => ({ ...tokens, reducedMotion }), [reducedMotion]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
