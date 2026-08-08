import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { sha256Js } from './sha256';

const API_OVERRIDE_KEY = 'frescoop.mobile.api-override.v1';
const AUTH_TOKEN_KEY = 'frescoop.mobile.auth-token.v1';

let authToken: string | null = null;

export async function loadAuthToken(): Promise<void> {
  try {
    authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {}
}

export async function setAuthToken(token: string | null): Promise<void> {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

function resolveAutoApiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri && typeof hostUri === 'string') {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost') return `http://${host}:4174`; // dev only
  }

  if (Platform.OS === 'android') return 'https://frescoop.onrender.com';
  return 'https://frescoop.onrender.com';
}

export const API_BASE_AUTO = resolveAutoApiBase();

let currentBase = API_BASE_AUTO;

export function getApiBase(): string {
  return currentBase;
}

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const res = await fetch(`${currentBase}${path}`, {
      headers,
      signal: controller.signal,
      ...init,
    });
    if (!res.ok) {
      const body = await res.text();
      let message = `API ${res.status}: ${body || res.statusText}`;
      try {
        const parsed = JSON.parse(body);
        if (parsed.error) message = parsed.error;
      } catch {}
      throw new Error(message);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

export type AuthResponse = {
  ok: boolean;
  token?: string;
  user?: any;
  error?: string;
};

export const api = {
  health: () => request<{ ok: boolean; mode: string }>('/api/health'),
  getStore: () => request<Store>('/api/store'),
  putStore: (store: Store) =>
    request<{ ok: true }>('/api/store', {
      method: 'PUT',
      body: JSON.stringify(store),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (input: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    organization?: string;
    region?: string;
  }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getMe: () => request<{ ok: boolean; user: any }>('/api/auth/me'),

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
  } catch {}
  return sha256Js(password);
}
