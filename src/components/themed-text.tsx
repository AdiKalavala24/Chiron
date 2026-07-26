import { Text, type TextProps } from 'react-native';

import { FontWeights, ThemeColor, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  /**
   * `display`/`h1`/`h2`/`h3` use Outfit (heading font, bold/extrabold).
   * Everything else uses Plus Jakarta Sans (body font).
   */
  type?: 'display' | 'h1' | 'h2' | 'h3' | 'bodyLg' | 'body' | 'bodySm' | 'label' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'foreground'] },
        typeStyles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const typeStyles = {
  display: { ...Type['4xl'], ...FontWeights.headingExtraBold },
  h1: { ...Type['3xl'], ...FontWeights.headingExtraBold },
  h2: { ...Type['2xl'], ...FontWeights.headingBold },
  h3: { ...Type.xl, ...FontWeights.headingBold },
  bodyLg: { ...Type.lg, ...FontWeights.bodyRegular },
  body: { ...Type.base, ...FontWeights.bodyRegular },
  bodySm: { ...Type.sm, ...FontWeights.bodyMedium },
  label: {
    ...Type.xs,
    ...FontWeights.bodyBold,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  code: { ...Type.sm, fontFamily: 'monospace' },
};
