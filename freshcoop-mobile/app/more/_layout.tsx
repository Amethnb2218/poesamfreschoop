import { Stack } from 'expo-router';

import { Palette } from '@/constants/theme';

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Palette.paper },
        headerTintColor: Palette.ink,
        headerTitleStyle: { fontWeight: '900' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Palette.paper },
      }}
    />
  );
}
