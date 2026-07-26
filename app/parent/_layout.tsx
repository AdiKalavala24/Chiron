import React from 'react';
import { Stack } from 'expo-router';

const stackScreenOptions = { headerShown: false } as const;

export default function ParentLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
