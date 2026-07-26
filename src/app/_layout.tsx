import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { EngagementProvider } from '@/adaptive';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useAppFonts } from '@/hooks/use-app-fonts';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const fontsLoaded = useAppFonts();

  // Native splash (kept up via preventAutoHideAsync above) stays visible until
  // fonts are ready, so headings/body text never flash in the wrong typeface.
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <EngagementProvider>
        <AppTabs />
      </EngagementProvider>
    </ThemeProvider>
  );
}
