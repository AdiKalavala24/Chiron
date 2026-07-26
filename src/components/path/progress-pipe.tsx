import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';

interface ProgressPipeProps {
  /** True once the node above this pipe is completed/mastered — fills the pipe with color. */
  filled: boolean;
}

/** The short vertical connector stamped between consecutive path nodes. */
export function ProgressPipe({ filled }: ProgressPipeProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 10,
        height: 36,
        borderRadius: 5,
        backgroundColor: filled ? theme.colors.quaternary : theme.colors.muted,
        borderWidth: theme.borderWidth.hairline,
        borderColor: theme.colors.border,
      }}
    />
  );
}
