import { Stack } from 'expo-router';

import { Palette } from '@/constants/theme';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Palette.paper },
        headerTintColor: Palette.ink,
        headerTitleStyle: { fontWeight: '900' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Palette.paper },
      }}
    />
  );
}
