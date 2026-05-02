import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMPTY_STORE, Store } from './api';

const STORE_CACHE_KEY = 'frescoop.mobile.store-cache.v1';
const STORE_CACHE_STAMP = 'frescoop.mobile.store-cache.stamp.v1';

export type CachedStore = {
  store: Store;
  cachedAt: number;
};

export async function readCachedStore(): Promise<CachedStore | null> {
  try {
    const [raw, stamp] = await Promise.all([
      AsyncStorage.getItem(STORE_CACHE_KEY),
      AsyncStorage.getItem(STORE_CACHE_STAMP),
    ]);
    if (!raw) return null;
    return {
      store: { ...EMPTY_STORE, ...JSON.parse(raw) },
      cachedAt: Number(stamp) || 0,
    };
  } catch {
    return null;
  }
}

export async function writeCachedStore(store: Store): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [STORE_CACHE_KEY, JSON.stringify(store)],
      [STORE_CACHE_STAMP, String(Date.now())],
    ]);
  } catch {}
}
