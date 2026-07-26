import {
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts as useOutfitFonts,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
  useFonts as useJakartaFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

/**
 * Loads the two typefaces the design system relies on: Outfit for headings,
 * Plus Jakarta Sans for body copy. On web these are already declared via
 * `@font-face`-free system stacks in `theme.ts`, but we still request them so
 * native (iOS/Android) gets the real files.
 */
export function useAppFonts() {
  const [outfitLoaded] = useOutfitFonts({ Outfit_700Bold, Outfit_800ExtraBold });
  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });

  return outfitLoaded && jakartaLoaded;
}
