import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface PillChipProps {
  label: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Chunky-border pill used for the method chip, the grade chip ("tap to
 * change"), and skill chips inside games. Non-interactive when `onPress`
 * is omitted.
 */
export function PillChip({ label, icon, backgroundColor, textColor, onPress, selected, style, testID }: PillChipProps) {
  const theme = useTheme();
  const Wrapper = onPress ? Pressable : View;
  const bg = backgroundColor ?? (selected ? theme.colors.accent : theme.colors.card);
  const fg = textColor ?? (selected ? theme.colors.accentForeground : theme.colors.foreground);

  return (
    <Wrapper onPress={onPress} testID={testID} hitSlop={6}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space[2],
            paddingHorizontal: theme.space[4],
            paddingVertical: theme.space[2],
            borderRadius: theme.radius.full,
            borderWidth: theme.borderWidth.chunky,
            borderColor: theme.colors.foreground,
            backgroundColor: bg,
            minHeight: theme.minTapTarget * 0.6,
          },
          style,
        ]}
      >
        {icon}
        <Text
          style={{
            fontFamily: theme.fontFamily.bodyBold,
            fontSize: theme.fontSize.sm,
            color: fg,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Wrapper>
  );
}
