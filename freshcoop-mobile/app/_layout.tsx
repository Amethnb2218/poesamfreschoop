import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppBoot } from '@/components/AppBoot';
import { DialogProvider } from '@/components/AppDialog';
import { Yaay } from '@/components/Yaay';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from '@/context/SessionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <CartProvider>
         <DialogProvider>
         <AppBoot>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" options={{ animation: 'fade' }} />
              <Stack.Screen
                name="product/[id]"
                options={{ presentation: 'card', animation: 'slide_from_right' }}
              />
              <Stack.Screen name="order/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen
                name="new-product"
                options={{ presentation: 'modal', title: 'Nouveau produit' }}
              />
              <Stack.Screen
                name="new-lot"
                options={{ presentation: 'modal', title: 'Nouveau lot' }}
              />
              <Stack.Screen
                name="edit-profile"
                options={{ presentation: 'modal', title: 'Modifier le profil' }}
              />
              <Stack.Screen name="messages/index" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen
                name="messages/[id]"
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen name="scan" options={{ presentation: 'modal', title: 'Scanner' }} />
              <Stack.Screen name="search" options={{ animation: 'fade' }} />
              <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="lot/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="checkout" options={{ presentation: 'modal', title: 'Paiement' }} />
              <Stack.Screen
                name="new/[type]"
                options={{ presentation: 'modal', title: 'Nouveau' }}
              />
              <Stack.Screen name="help" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="terms" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="attestation/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen
                name="edit-product/[id]"
                options={{ presentation: 'modal', title: 'Modifier produit' }}
              />
              <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
              <Stack.Screen name="pitch" options={{ animation: 'fade' }} />
            </Stack>
            <StatusBar style="auto" />
            <Yaay />
          </ThemeProvider>
         </AppBoot>
         </DialogProvider>
        </CartProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
