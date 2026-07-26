import React from 'react';
import { Stack } from 'expo-router';

const stackScreenOptions = { headerShown: false } as const;

export default function KidLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
