import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { sha256Js } from './sha256';

const API_OVERRIDE_KEY = 'frescoop.mobile.api-override.v1';

function resolveAutoApiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri && typeof hostUri === 'string') {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost') return `http://${host}:4174`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:4174';
  return 'http://127.0.0.1:4174';
}

export const API_BASE_AUTO = resolveAutoApiBase();

// Base API courante — modifiable à chaud depuis l'écran Données
let currentBase = API_BASE_AUTO;

export function getApiBase(): string {
  return currentBase;
}

// Rétro-compat
export const API_BASE = currentBase;

export async function loadApiOverride(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(API_OVERRIDE_KEY);
    if (saved) currentBase = saved.replace(/\/$/, '');
  } catch {}
}

export async function setApiOverride(url: string | null): Promise<void> {
  if (!url) {
    currentBase = API_BASE_AUTO;
    await AsyncStorage.removeItem(API_OVERRIDE_KEY);
    return;
  }
  const clean = url.trim().replace(/\/$/, '');
  currentBase = clean;
  await AsyncStorage.setItem(API_OVERRIDE_KEY, clean);
}

export type Store = {
  users: any[];
  products: any[];
  dossiers: any[];
  attestations: any[];
  transactions: any[];
  proofs: any[];
  hubs: any[];
  orders: any[];
  messages: any[];
  notifications: any[];
  cooperatives: any[];
  crates: any[];
  lots: any[];
  lotPhotos: any[];
  sensorDevices: any[];
  sensorReadings: any[];
  qualityAssessments: any[];
  buyers: any[];
  buyerOrders: any[];
  reservations: any[];
  dispatches: any[];
  paymentRecords: any[];
  payoutRecords: any[];
  consentRecords: any[];
  economicProfiles: any[];
  partnerOffers: any[];
  alerts: any[];
  auditLogs: any[];
  kpiAggregates: any[];
  loans: any[];
};

export const EMPTY_STORE: Store = {
  users: [],
  products: [],
  dossiers: [],
  attestations: [],
  transactions: [],
  proofs: [],
  hubs: [],
  orders: [],
  messages: [],
  notifications: [],
  cooperatives: [],
  crates: [],
  lots: [],
  lotPhotos: [],
  sensorDevices: [],
  sensorReadings: [],
  qualityAssessments: [],
  buyers: [],
  buyerOrders: [],
  reservations: [],
  dispatches: [],
  paymentRecords: [],
  payoutRecords: [],
  consentRecords: [],
  economicProfiles: [],
  partnerOffers: [],
  alerts: [],
  auditLogs: [],
  kpiAggregates: [],
  loans: [],
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${currentBase}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean; mode: string }>('/api/health'),
  getStore: () => request<Store>('/api/store'),
  putStore: (store: Store) =>
    request<{ ok: true }>('/api/store', {
      method: 'PUT',
      body: JSON.stringify(store),
    }),
  createPaydunyaInvoice: (input: {
    amount: number;
    description: string;
    orderIds: string[];
    payerId: string;
    receiptCode: string;
    storePhone?: string;
  }) =>
    request<{ ok: boolean; token?: string; url?: string; error?: string }>(
      '/api/paydunya/create-invoice',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    ),

  yaayChat: (input: {
    message: string;
    lang: 'fr' | 'wo' | 'pul' | 'sr';
    context: {
      stats: Record<string, number>;
      userRole?: string;
      userName?: string;
    };
    history?: { from: 'user' | 'bot'; text: string }[];
  }) =>
    request<{ ok: boolean; answer?: string; error?: string; fallback?: boolean }>(
      '/api/yaay/chat',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    ),
};

// Hash SHA-256 hex du mot de passe — doit matcher le calcul du site web.
// React Native n'expose pas crypto.subtle donc on passe par le fallback JS pur,
// qui est exactement celui utilisé par le site (sha256Js dans App.jsx).
export async function hashPassword(password: string): Promise<string> {
  try {
    const digest = await globalThis.crypto?.subtle?.digest?.(
      'SHA-256',
      new TextEncoder().encode(password),
    );
    if (digest) {
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // continue sur le fallback
  }
  return sha256Js(password);
}
