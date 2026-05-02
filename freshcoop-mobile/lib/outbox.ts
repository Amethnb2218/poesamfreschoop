import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, Store } from './api';

const OUTBOX_KEY = 'frescoop.mobile.outbox.v1';

export type OutboxEntry = {
  id: string;
  createdAt: number;
  kind: 'product-create' | 'order-create' | 'order-status' | 'message' | 'lot-create' | 'generic';
  description: string;
  payload: any;
};

async function readOutbox(): Promise<OutboxEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeOutbox(entries: OutboxEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
  } catch {}
}

export async function queueEntry(entry: Omit<OutboxEntry, 'id' | 'createdAt'>): Promise<void> {
  const entries = await readOutbox();
  entries.push({
    id: `out-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    ...entry,
  });
  await writeOutbox(entries);
}

export async function getOutbox(): Promise<OutboxEntry[]> {
  return readOutbox();
}

export async function clearOutbox(): Promise<void> {
  await writeOutbox([]);
}

/**
 * Tente d'envoyer toutes les entrées pending : on applique les mutations
 * successivement au store courant. Le payload doit contenir une fonction
 * sérialisable "mutate" impossible, donc on stocke plutôt des patches
 * indexés (arrayKey + object à ajouter).
 */
export async function flushOutbox(): Promise<number> {
  const entries = await readOutbox();
  if (entries.length === 0) return 0;
  let current: Store;
  try {
    current = await api.getStore();
  } catch {
    return 0;
  }
  let applied = 0;
  for (const entry of entries) {
    try {
      if (entry.payload?.arrayKey && entry.payload?.item) {
        const key = entry.payload.arrayKey as keyof Store;
        const arr = Array.isArray(current[key]) ? (current[key] as any[]) : [];
        (current as any)[key] = [entry.payload.item, ...arr];
        applied++;
      }
    } catch {
      // on ignore et on laisse l'entrée en outbox
    }
  }
  if (applied > 0) {
    try {
      await api.putStore(current);
      await writeOutbox([]);
    } catch {
      // échec → on garde l'outbox
      return 0;
    }
  }
  return applied;
}
