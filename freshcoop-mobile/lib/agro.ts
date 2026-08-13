// Client des endpoints /api/agro (prédiction agronomique + conseiller).
//
// Les référentiels et la dernière prédiction consultée sont mis en cache dans
// AsyncStorage : en zone rurale la connexion est intermittente, et un
// agriculteur doit pouvoir relire sa fenêtre de semis hors ligne.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBase, getAuthToken } from './api';

const CACHE_PREFIX = 'frescoop.mobile.agro.';
const REFERENTIAL_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours
const PREDICTION_TTL = 24 * 60 * 60 * 1000; // 1 jour

export type Crop = {
  id: string;
  name: string;
  cycleDays: number;
  waterNeeds: number;
  varieties: Variety[];
  optimalSowingWindow: { start: number; end: number } | null;
};

export type Variety = { name: string; cycle: number; zone: string; yield: string };

export type City = { id: string; name: string; area: string; zone: string };
export type CountryGroup = { country: string; label: string; cities: City[] };

export type RiskItem = { type: string; severity: 'high' | 'medium' | 'low'; detail: string };

export type WaterAnalysis = {
  needed: number;
  expected: number;
  deficit: number;
  irrigationNeeded: boolean;
};

export type MonthScore = {
  month: number;
  monthName: string;
  score: number;
  risks: RiskItem[];
  recommendation: { level: string; text: string };
  waterAnalysis: WaterAnalysis;
};

export type Prediction = {
  crop: string;
  cropId: string;
  city: string;
  cityName: string;
  zone: string;
  currentMonth: MonthScore;
  optimal: MonthScore;
  timeline: MonthScore[];
  recommendedVarieties: Variety[];
  cropInfo: { cycleDays: number; waterNeeds: number; optimalTemp: number };
};

export type YieldPrediction = {
  crop: string;
  cityName: string;
  sowMonth: number;
  weather_source: string;
  realtime_data: {
    current_temp?: number;
    humidity?: number;
    description?: string;
    forecast_days?: number;
  } | null;
  regression?: {
    predicted_yield_kg: number;
    adj_r_squared: string;
    rmse: number;
    model_type: string;
  };
  knn?: { predicted_yield_kg: number; confidence: string; k: number };
  ensemble?: {
    predicted_yield_kg: number;
    accuracy: string;
    cv_mape: string;
    method: string;
    model_agreement: string;
    training_samples: number;
    scope: string;
    weights?: { regression: string; knn: string };
    confidence_interval?: { low: number; high: number; level: string };
  };
};

export type RiskAssessment = {
  safetyScore: number;
  recommendation: string;
  month: string;
  factors: Record<string, string>;
  outcomes: Record<string, string>;
};

export type AdvisorReply = {
  ok: boolean;
  answer: string;
  source: 'llm' | 'offline';
  agronomy: boolean;
};

type Cached<T> = { value: T; at: number };

async function readCache<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached<T>;
    if (!parsed?.at || Date.now() - parsed.at > ttl) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ value, at: Date.now() }));
  } catch {}
}

async function get<T>(path: string, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${getApiBase()}${path}`, { signal: controller.signal });
    if (!res.ok) {
      let message = `Erreur ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {}
      throw new Error(message);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Récupère une ressource en privilégiant le réseau, avec repli sur le cache.
 * Renvoie aussi l'origine de la donnée pour pouvoir l'indiquer à l'écran.
 */
async function getWithCache<T>(
  path: string,
  cacheKey: string,
  ttl: number,
): Promise<{ data: T; fromCache: boolean }> {
  try {
    const data = await get<T>(path);
    await writeCache(cacheKey, data);
    return { data, fromCache: false };
  } catch (error) {
    const cached = await readCache<T>(cacheKey, ttl);
    if (cached) return { data: cached, fromCache: true };
    throw error;
  }
}

export async function fetchCrops(): Promise<{ data: Crop[]; fromCache: boolean }> {
  const res = await getWithCache<{ crops: Crop[] }>('/api/agro/crops', 'crops', REFERENTIAL_TTL);
  return { data: res.data.crops || [], fromCache: res.fromCache };
}

export async function fetchCities(): Promise<{ data: CountryGroup[]; fromCache: boolean }> {
  const res = await getWithCache<{ countries: CountryGroup[] }>(
    '/api/agro/cities',
    'cities',
    REFERENTIAL_TTL,
  );
  return { data: res.data.countries || [], fromCache: res.fromCache };
}

export function fetchPrediction(crop: string, city: string) {
  return getWithCache<Prediction>(
    `/api/agro/predict/${crop}/${city}`,
    `predict.${crop}.${city}`,
    PREDICTION_TTL,
  );
}

export function fetchYield(crop: string, city: string, month: number) {
  return getWithCache<YieldPrediction>(
    `/api/agro/yield/${crop}/${city}?month=${month}`,
    `yield.${crop}.${city}.${month}`,
    PREDICTION_TTL,
  );
}

export function fetchRisk(crop: string, city: string, month: number) {
  return getWithCache<RiskAssessment>(
    `/api/agro/risk/${crop}/${city}/${month}`,
    `risk.${crop}.${city}.${month}`,
    PREDICTION_TTL,
  );
}

/** Le conseiller exige un compte authentifié : il relaie vers un LLM facturé. */
export async function askAdvisor(input: {
  message: string;
  language: 'fr' | 'wo' | 'pu' | 'sr';
  context?: Record<string, unknown>;
  history?: { from: 'user' | 'bot'; text: string }[];
}): Promise<AdvisorReply> {
  const token = getAuthToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(`${getApiBase()}/api/agro/advisor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.answer) {
      throw new Error(body?.error || 'Le conseiller est momentanement indisponible.');
    }
    return body as AdvisorReply;
  } finally {
    clearTimeout(timer);
  }
}

export const MONTH_NAMES = [
  '',
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export function scoreTone(score: number): 'green' | 'blue' | 'gold' | 'coral' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'gold';
  return 'coral';
}

export function riskLabel(type: string): string {
  return (
    {
      drought: 'Déficit hydrique',
      flood: "Excès d'eau",
      temperature: 'Stress thermique',
      timing: 'Calendrier',
      zone: 'Adaptation variétale',
    } as Record<string, string>
  )[type] || type;
}
