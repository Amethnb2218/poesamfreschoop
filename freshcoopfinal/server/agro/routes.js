/**
 * Routes /api/agro/* — Prediction agronomique et Conseiller agricole.
 *
 * Le handler recoit ses dependances (sendJson, readBody, requireAuth,
 * callOpenRouter) depuis server/index.js : pas de duplication des helpers HTTP
 * et le module reste testable sans demarrer le serveur.
 */

import { getCitiesByCountry, normalizeCityKey, SAHEL_CITIES, MONTH_DATA, cityName } from './cities.js';
import { findOptimalSowingDate, getAvailableCrops, CROP_PROFILES } from './prediction.js';
import { predictYield, optimizeCropCalendar, assessRiskBayesian, getModelMetrics } from './ml.js';
import { fetchRealWeather } from './weather.js';
import { askAdvisor, isAgronomyQuestion } from './advisor.js';

const DEFAULT_MODELS = 'openai/gpt-oss-120b:free,meta-llama/llama-3.3-70b-instruct:free,google/gemma-3-27b-it:free';

// Limite dediee au conseiller : il consomme un LLM facture, on le protege
// independamment du quota general (utilisateur authentifie, 20 req/10 min).
const advisorBuckets = new Map();
const ADVISOR_WINDOW_MS = 10 * 60 * 1000;
const ADVISOR_MAX = 20;

function checkAdvisorQuota(userId) {
  const now = Date.now();
  let bucket = advisorBuckets.get(userId);
  if (!bucket || now - bucket.start > ADVISOR_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    advisorBuckets.set(userId, bucket);
  }
  bucket.count += 1;
  return bucket.count <= ADVISOR_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of advisorBuckets) {
    if (now - bucket.start > ADVISOR_WINDOW_MS * 2) advisorBuckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

function zoneRainMultiplier(zone) {
  if (zone === 'casamancaise' || zone === 'guineenne') return 1.5;
  if (zone === 'soudanienne') return 1.2;
  if (zone === 'fleuve') return 0.6;
  return 0.8;
}

function historicalSeasonRain(sowMonth, zone) {
  const multiplier = zoneRainMultiplier(zone);
  let total = 0;
  for (let i = 0; i < 4; i += 1) {
    const month = ((sowMonth - 1 + i) % 12) + 1;
    total += (MONTH_DATA[month]?.rain_mm || 0) * multiplier;
  }
  return total;
}

/**
 * Rendement estime, enrichi de la meteo temps reel quand OPENWEATHER_API_KEY
 * est configuree. Sans cle, on retombe sur les moyennes climatiques ANACIM.
 */
async function computeYield(crop, cityKey, sowMonth) {
  const cityData = SAHEL_CITIES[cityKey];
  const monthData = MONTH_DATA[sowMonth];
  const multiplier = zoneRainMultiplier(cityData.zone);

  let rainTotal = 0;
  let tempAvg = (monthData.temp_max + monthData.temp_min) / 2 + (cityData.tempOffset || 0);
  let weatherSource = 'moyennes_climatiques';

  const realWeather = await fetchRealWeather(cityKey);
  if (realWeather?.forecast?.length) {
    const forecast = realWeather.forecast;
    tempAvg = forecast.reduce((sum, d) => sum + (d.temp_max + d.temp_min) / 2, 0) / forecast.length;
    const rain7d = forecast.reduce((sum, d) => sum + (d.rain_mm || 0), 0);

    if (rain7d < 2) {
      // Saison seche : extrapoler 7 jours de pluie nulle serait absurde.
      rainTotal = historicalSeasonRain(sowMonth, cityData.zone);
    } else {
      const weeksInSeason = 4 * 4.3;
      rainTotal = rain7d * weeksInSeason * multiplier * 0.6;
    }
    weatherSource = 'openweathermap';
  } else {
    rainTotal = historicalSeasonRain(sowMonth, cityData.zone);
  }

  const result = predictYield(crop, cityKey, rainTotal, tempAvg, sowMonth);

  if (result.ensemble) {
    const value = result.ensemble.predicted_yield_kg;
    const mape = parseFloat(result.ensemble.cv_mape) || 15;
    const margin = Math.round((value * mape) / 100);
    result.ensemble.confidence_interval = {
      low: Math.max(0, value - margin),
      high: value + margin,
      level: '90%',
    };
  }

  result.city = cityKey;
  result.cityName = cityName(cityKey);
  result.sowMonth = sowMonth;
  result.weather_source = weatherSource;
  result.realtime_data = realWeather
    ? {
        current_temp: realWeather.current?.temp,
        humidity: realWeather.current?.humidity,
        description: realWeather.current?.description,
        forecast_days: realWeather.forecast?.length || 0,
      }
    : null;

  return result;
}

/**
 * @param {import('node:http').IncomingMessage} request
 * @param {import('node:http').ServerResponse} response
 * @param {{ sendJson: Function, readBody: Function, requireAuth: Function }} deps
 */
export async function handleAgroRequest(request, response, deps) {
  const { sendJson, readBody, requireAuth } = deps;
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const segments = url.pathname.replace(/^\/api\/agro\/?/, '').split('/').filter(Boolean);
  const [resource, ...rest] = segments;

  // --- Referentiels -------------------------------------------------------
  if (resource === 'cities' && request.method === 'GET') {
    sendJson(response, 200, { countries: getCitiesByCountry() });
    return;
  }

  if (resource === 'crops' && request.method === 'GET') {
    sendJson(response, 200, {
      crops: getAvailableCrops().map((crop) => ({
        ...crop,
        varieties: CROP_PROFILES[crop.id]?.varieties || [],
        optimalSowingWindow: CROP_PROFILES[crop.id]?.optimalSowingWindow || null,
      })),
    });
    return;
  }

  if (resource === 'metrics' && request.method === 'GET') {
    sendJson(response, 200, { models: getModelMetrics() });
    return;
  }

  // --- Fenetre de semis optimale -----------------------------------------
  if (resource === 'predict' && request.method === 'GET') {
    const [cropRaw, cityRaw] = rest;
    const crop = String(cropRaw || '').toLowerCase();
    const cityKey = normalizeCityKey(cityRaw);

    if (!CROP_PROFILES[crop]) {
      sendJson(response, 404, { error: 'Culture inconnue', crops: getAvailableCrops().map((c) => c.id) });
      return;
    }
    if (!SAHEL_CITIES[cityKey]) {
      sendJson(response, 404, { error: 'Zone inconnue' });
      return;
    }

    const prediction = findOptimalSowingDate(crop, cityKey);
    if (!prediction) {
      sendJson(response, 404, { error: 'Prediction indisponible pour ce couple culture/zone' });
      return;
    }
    sendJson(response, 200, { ...prediction, cropId: crop, cityName: cityName(cityKey) });
    return;
  }

  // --- Rendement estime ---------------------------------------------------
  if (resource === 'yield' && request.method === 'GET') {
    const [cropRaw, cityRaw] = rest;
    const crop = String(cropRaw || '').toLowerCase();
    const cityKey = normalizeCityKey(cityRaw);

    if (!CROP_PROFILES[crop]) {
      sendJson(response, 404, { error: 'Culture inconnue' });
      return;
    }
    if (!SAHEL_CITIES[cityKey]) {
      sendJson(response, 404, { error: 'Zone inconnue' });
      return;
    }

    const parsedMonth = Number.parseInt(url.searchParams.get('month'), 10);
    const sowMonth = Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : new Date().getMonth() + 1;

    sendJson(response, 200, await computeYield(crop, cityKey, sowMonth));
    return;
  }

  // --- Risque bayesien ----------------------------------------------------
  if (resource === 'risk' && request.method === 'GET') {
    const [cropRaw, cityRaw, monthRaw] = rest;
    const crop = String(cropRaw || '').toLowerCase();
    const cityKey = normalizeCityKey(cityRaw);
    const month = Number.parseInt(monthRaw, 10);

    if (!SAHEL_CITIES[cityKey] || !Number.isInteger(month) || month < 1 || month > 12) {
      sendJson(response, 400, { error: 'Parametres invalides' });
      return;
    }

    const result = assessRiskBayesian(crop, cityKey, month);
    if (!result) {
      sendJson(response, 404, { error: 'Evaluation indisponible' });
      return;
    }
    sendJson(response, 200, result);
    return;
  }

  // --- Calendrier optimise (algorithme genetique) -------------------------
  if (resource === 'calendar' && request.method === 'POST') {
    let payload;
    try {
      payload = JSON.parse((await readBody(request)) || '{}');
    } catch {
      sendJson(response, 400, { error: 'JSON invalide' });
      return;
    }

    const crops = (Array.isArray(payload.crops) ? payload.crops : [payload.crops])
      .map((c) => String(c || '').toLowerCase())
      .filter((c) => CROP_PROFILES[c]);
    const cityKey = normalizeCityKey(payload.city);
    const parcels = Math.min(6, Math.max(1, Number.parseInt(payload.parcels, 10) || 3));

    if (!crops.length) {
      sendJson(response, 400, { error: 'Au moins une culture valide est requise' });
      return;
    }
    if (!SAHEL_CITIES[cityKey]) {
      sendJson(response, 404, { error: 'Zone inconnue' });
      return;
    }

    const result = optimizeCropCalendar(crops, cityKey, { parcels });
    if (!result) {
      sendJson(response, 404, { error: 'Optimisation indisponible' });
      return;
    }
    sendJson(response, 200, result);
    return;
  }

  // --- Conseiller agricole ------------------------------------------------
  if (resource === 'advisor' && request.method === 'POST') {
    // Le conseiller relaie vers un LLM facture : authentification obligatoire.
    const authData = requireAuth(request);
    if (!authData) {
      sendJson(response, 401, { error: 'Connectez-vous pour utiliser le conseiller.' });
      return;
    }
    if (!checkAdvisorQuota(authData.uid)) {
      sendJson(response, 429, { error: 'Limite de questions atteinte. Reessayez dans quelques minutes.' });
      return;
    }

    let payload;
    try {
      payload = JSON.parse((await readBody(request)) || '{}');
    } catch {
      sendJson(response, 400, { error: 'JSON invalide' });
      return;
    }

    const message = String(payload.message || '').trim();
    if (!message) {
      sendJson(response, 400, { error: 'message requis' });
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const models = (process.env.OPENROUTER_MODELS || process.env.OPENROUTER_MODEL || DEFAULT_MODELS)
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    // Essaie les modeles dans l'ordre, tombe sur le moteur hors-ligne si aucun
    // ne repond (ou si aucune cle n'est configuree).
    const callLlm = apiKey && typeof deps.callOpenRouter === 'function'
      ? async (messages) => {
          let lastError = null;
          for (const model of models) {
            try {
              return await deps.callOpenRouter(apiKey, model, messages, { temperature: 0.6, max_tokens: 900 });
            } catch (error) {
              lastError = error;
            }
          }
          throw lastError || new Error('Aucun modele disponible');
        }
      : null;

    const result = await askAdvisor({
      message,
      language: ['fr', 'wo', 'pu', 'sr', 'en', 'ar'].includes(payload.language) ? payload.language : 'fr',
      context: payload.context && typeof payload.context === 'object' ? payload.context : {},
      history: Array.isArray(payload.history) ? payload.history : [],
      callLlm,
    });

    sendJson(response, 200, {
      ok: true,
      answer: result.answer,
      source: result.source,
      model: result.model || null,
      agronomy: isAgronomyQuestion(message),
    });
    return;
  }

  sendJson(response, 404, { error: 'Endpoint agro inconnu' });
}

export { isAgronomyQuestion };
