import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Dans Expo Go (SDK 53+) les push remotes ne sont plus supportées. On évite
// même de charger le module côté Expo Go pour ne pas polluer la console, et
// on se limite aux notifications locales (scheduleNotificationAsync + trigger null).
// En dev build / standalone, on utilise expo-notifications comme d'habitude.

const isExpoGo = Constants.appOwnership === 'expo';

let configured = false;
let permissionGranted: boolean | null = null;
let mod: typeof import('expo-notifications') | null = null;

async function loadModule() {
  if (mod || isExpoGo) return mod;
  try {
    mod = await import('expo-notifications');
  } catch {
    mod = null;
  }
  return mod;
}

export async function setupNotifications(): Promise<void> {
  if (configured) return;
  configured = true;

  if (isExpoGo) {
    // Pas de notifications système dans Expo Go SDK 54. Les alertes passeront
    // par des bannières in-app (à implémenter côté UI si besoin).
    permissionGranted = false;
    return;
  }

  const m = await loadModule();
  if (!m) {
    permissionGranted = false;
    return;
  }

  m.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  if (Platform.OS === 'android') {
    try {
      await m.setNotificationChannelAsync('default', {
        name: 'FresCoop',
        importance: m.AndroidImportance.HIGH,
        vibrationPattern: [0, 120, 80, 120],
        lightColor: '#1f835d',
      });
    } catch {}
  }

  try {
    const current = await m.getPermissionsAsync();
    if (current.status === 'granted') {
      permissionGranted = true;
      return;
    }
    const next = await m.requestPermissionsAsync();
    permissionGranted = next.status === 'granted';
  } catch {
    permissionGranted = false;
  }
}

export async function pushLocalNotification(input: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  if (permissionGranted === false) return;
  const m = await loadModule();
  if (!m) return;
  try {
    await m.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        data: input.data,
        sound: 'default',
      },
      trigger: null,
    });
  } catch {}
}
