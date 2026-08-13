import { SAHEL_CITIES, MONTH_DATA } from './cities.js';

// Besoins hydriques par culture (mm d'eau sur tout le cycle)
const CROP_PROFILES = {
  arachide: {
    name: 'Arachide',
    waterNeeds: 500, // mm total sur le cycle
    cycleDays: 100,
    optimalSowingWindow: { start: 6, end: 7 }, // mois
    minRainToSow: 20, // mm pour pluie utile
    tempMin: 20,
    tempMax: 40,
    optimalTemp: 28,
    droughtTolerance: 0.4, // 0-1
    floodTolerance: 0.3,
    varieties: [
      { name: '55-437', cycle: 90, zone: 'sahélienne', yield: '1.5-2 t/ha' },
      { name: 'Fleur 11', cycle: 95, zone: 'sahélienne', yield: '1.8-2.2 t/ha' },
      { name: '73-33', cycle: 105, zone: 'soudanienne', yield: '2-2.5 t/ha' },
      { name: 'GC 8-35', cycle: 110, zone: 'casamançaise', yield: '2.2-3 t/ha' }
    ]
  },
  mil: {
    name: 'Mil (souna)',
    waterNeeds: 350,
    cycleDays: 90,
    optimalSowingWindow: { start: 6, end: 7 },
    minRainToSow: 20,
    tempMin: 22,
    tempMax: 45,
    optimalTemp: 30,
    droughtTolerance: 0.8,
    floodTolerance: 0.2,
    varieties: [
      { name: 'Souna 3', cycle: 90, zone: 'sahélienne', yield: '1.5-2 t/ha' },
      { name: 'Thialack 2', cycle: 85, zone: 'sahélienne', yield: '1.8-2.2 t/ha' },
      { name: 'IBV 8004', cycle: 75, zone: 'sahélienne', yield: '1.2-1.5 t/ha' }
    ]
  },
  mais: {
    name: 'Maïs',
    waterNeeds: 600,
    cycleDays: 100,
    optimalSowingWindow: { start: 6, end: 7 },
    minRainToSow: 25,
    tempMin: 18,
    tempMax: 38,
    optimalTemp: 26,
    droughtTolerance: 0.3,
    floodTolerance: 0.3,
    varieties: [
      { name: 'Early Thai', cycle: 75, zone: 'toutes', yield: '2-3 t/ha' },
      { name: 'Synthetic C', cycle: 90, zone: 'soudanienne', yield: '3-4 t/ha' },
      { name: 'JDB', cycle: 100, zone: 'casamançaise', yield: '3.5-4.5 t/ha' }
    ]
  },
  riz: {
    name: 'Riz',
    waterNeeds: 900,
    cycleDays: 120,
    optimalSowingWindow: { start: 7, end: 8 },
    minRainToSow: 30,
    tempMin: 20,
    tempMax: 38,
    optimalTemp: 28,
    droughtTolerance: 0.1,
    floodTolerance: 0.9,
    varieties: [
      { name: 'ISRIZ 12', cycle: 110, zone: 'fleuve', yield: '5-7 t/ha' },
      { name: 'Sahel 202', cycle: 120, zone: 'fleuve', yield: '6-8 t/ha' },
      { name: 'NERICA 4', cycle: 90, zone: 'casamançaise', yield: '3-4 t/ha' }
    ]
  },
  niebe: {
    name: 'Niébé',
    waterNeeds: 300,
    cycleDays: 65,
    optimalSowingWindow: { start: 7, end: 8 },
    minRainToSow: 15,
    tempMin: 20,
    tempMax: 42,
    optimalTemp: 30,
    droughtTolerance: 0.7,
    floodTolerance: 0.2,
    varieties: [
      { name: 'Melakh', cycle: 60, zone: 'sahélienne', yield: '1-1.5 t/ha' },
      { name: 'Mouride', cycle: 65, zone: 'sahélienne', yield: '1.2-1.8 t/ha' },
      { name: 'Yacine', cycle: 70, zone: 'soudanienne', yield: '1.5-2 t/ha' }
    ]
  },
  sorgho: {
    name: 'Sorgho',
    waterNeeds: 450,
    cycleDays: 110,
    optimalSowingWindow: { start: 6, end: 7 },
    minRainToSow: 20,
    tempMin: 21,
    tempMax: 44,
    optimalTemp: 30,
    droughtTolerance: 0.75,
    floodTolerance: 0.35,
    varieties: [
      { name: 'F2-20', cycle: 100, zone: 'sahélienne', yield: '1-1.5 t/ha' },
      { name: 'CE 180-33', cycle: 110, zone: 'soudanienne', yield: '1.5-2.2 t/ha' },
      { name: 'Faourou', cycle: 90, zone: 'soudanienne', yield: '1.3-1.8 t/ha' },
      { name: 'Nganda', cycle: 120, zone: 'casamançaise', yield: '2-2.5 t/ha' }
    ]
  },
  oignon: {
    name: 'Oignon',
    waterNeeds: 550,
    cycleDays: 140,
    optimalSowingWindow: { start: 10, end: 1 },
    minRainToSow: 0, // irrigué
    tempMin: 13,
    tempMax: 35,
    optimalTemp: 22,
    droughtTolerance: 0.25,
    floodTolerance: 0.1,
    varieties: [
      { name: 'Violet de Galmi', cycle: 150, zone: 'toutes', yield: '25-35 t/ha' },
      { name: 'Noflaye', cycle: 140, zone: 'niayes', yield: '30-40 t/ha' },
      { name: 'Safari', cycle: 130, zone: 'fleuve', yield: '28-38 t/ha' }
    ]
  },
  tomate: {
    name: 'Tomate',
    waterNeeds: 700,
    cycleDays: 90,
    optimalSowingWindow: { start: 11, end: 2 },
    minRainToSow: 0, // irriguée
    tempMin: 15,
    tempMax: 35,
    optimalTemp: 24,
    droughtTolerance: 0.2,
    floodTolerance: 0.1,
    varieties: [
      { name: 'Xina', cycle: 85, zone: 'niayes', yield: '25-35 t/ha' },
      { name: 'Mongal F1', cycle: 80, zone: 'niayes', yield: '30-40 t/ha' },
      { name: 'Tropimech', cycle: 90, zone: 'toutes', yield: '20-30 t/ha' }
    ]
  }
};

// Les zones sont écrites avec accents dans les profils de culture
// ('sahélienne', 'casamançaise') mais sans accent dans le référentiel villes
// ('sahelienne', 'guineenne'). Sans normalisation, aucune variété ne matchait
// sa zone et le score prenait une pénalité injustifiée.
const ZONE_ALIASES = {
  sahelienne: 'sahelienne',
  soudanienne: 'soudanienne',
  casamancaise: 'guineenne',
  guineenne: 'guineenne',
  fleuve: 'fleuve',
  niayes: 'niayes',
  toutes: 'toutes',
};

function canonicalZone(zone) {
  const flat = String(zone || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return ZONE_ALIASES[flat] || flat;
}

function zoneMatches(varietyZone, cityZone) {
  const v = canonicalZone(varietyZone);
  if (v === 'toutes') return true;
  const c = canonicalZone(cityZone);
  if (v === c) return true;
  // Les variétés de vallée et de Niayes restent pertinentes en zone sahélienne
  // irriguée (fleuve Sénégal, nappe des Niayes).
  if ((v === 'fleuve' || v === 'niayes') && (c === 'sahelienne' || c === 'fleuve' || c === 'niayes')) return true;
  return false;
}

// Algorithme de scoring du risque (prend en compte la ville spécifique)
function computeRiskScore(crop, zone, month, cityKey) {
  const cityInfo = cityKey ? SAHEL_CITIES[cityKey] : (Object.values(SAHEL_CITIES).find(c => c.zone === zone) || Object.values(SAHEL_CITIES)[0]);
  const monthData = MONTH_DATA[month];
  const cropProfile = CROP_PROFILES[crop];
  if (!cropProfile) return null;

  const tempOffset = cityInfo ? (cityInfo.tempOffset || 0) : 0;
  let score = 100;
  const risks = [];

  // 1. Risque hydrique (40% du score) — ajusté par type de ville
  const cityZone = cityInfo ? cityInfo.zone : zone;
  const typeMultiplier = (cityInfo && cityInfo.type === 'cotiere') ? 0.8 : 1.0;
  const expectedRainInCycle = computeExpectedRain(month, cropProfile.cycleDays, cityZone, cityKey) * typeMultiplier;
  const waterDeficit = Math.max(0, cropProfile.waterNeeds - expectedRainInCycle);
  const waterRatio = expectedRainInCycle / cropProfile.waterNeeds;

  if (waterRatio < 0.5) {
    const penalty = (1 - waterRatio) * 40 * (1 - cropProfile.droughtTolerance);
    score -= penalty;
    risks.push({ type: 'drought', severity: waterRatio < 0.3 ? 'high' : 'medium', detail: `Déficit hydrique: ${Math.round(waterDeficit)}mm manquants` });
  } else if (waterRatio > 1.5) {
    const penalty = (waterRatio - 1.5) * 30 * (1 - cropProfile.floodTolerance);
    score -= penalty;
    risks.push({ type: 'flood', severity: waterRatio > 2 ? 'high' : 'medium', detail: `Excès d'eau: risque d'engorgement` });
  }

  // 2. Risque thermique (25% du score) — utilise le tempOffset de la ville
  const avgTemp = ((monthData.temp_max + tempOffset) + (monthData.temp_min + tempOffset)) / 2;
  const tempDiff = Math.abs(avgTemp - cropProfile.optimalTemp);
  if (tempDiff > 8) {
    score -= 20;
    risks.push({ type: 'temperature', severity: 'high', detail: `Température ${avgTemp > cropProfile.optimalTemp ? 'trop élevée' : 'trop basse'} (${Math.round(avgTemp)}°C vs optimal ${cropProfile.optimalTemp}°C)` });
  } else if (tempDiff > 4) {
    score -= 10;
    risks.push({ type: 'temperature', severity: 'medium', detail: `Température sub-optimale (${Math.round(avgTemp)}°C)` });
  }

  // 3. Fenêtre de semis (20% du score)
  const inWindow = isInSowingWindow(month, cropProfile.optimalSowingWindow);
  if (!inWindow) {
    score -= 20;
    risks.push({ type: 'timing', severity: 'high', detail: `Hors fenêtre optimale de semis (mois ${cropProfile.optimalSowingWindow.start}-${cropProfile.optimalSowingWindow.end})` });
  }

  // 4. Adaptation zonale (15% du score)
  const zoneVarieties = cropProfile.varieties.filter(v => zoneMatches(v.zone, cityZone));
  if (zoneVarieties.length === 0) {
    score -= 10;
    risks.push({ type: 'zone', severity: 'medium', detail: `Peu de variétés adaptées à la zone ${cityZone}` });
  }

  return {
    score: Math.max(0, Math.round(score)),
    risks,
    recommendation: getRecommendation(score),
    waterAnalysis: {
      needed: cropProfile.waterNeeds,
      expected: Math.round(expectedRainInCycle),
      deficit: Math.round(waterDeficit),
      irrigationNeeded: waterRatio < 0.7
    }
  };
}

function computeExpectedRain(startMonth, cycleDays, zone, cityKey) {
  const zoneMultiplier = (zone === 'casamançaise' || zone === 'guineenne') ? 1.5 : zone === 'soudanienne' ? 1.2 : 0.8;

  // Latitude-based adjustment: higher latitude = less rain in the Sahel
  let latFactor = 1.0;
  if (cityKey && SAHEL_CITIES[cityKey]) {
    const lat = SAHEL_CITIES[cityKey].lat;
    if (lat > 16) latFactor = 0.6;
    else if (lat > 15) latFactor = 0.75;
    else if (lat > 14) latFactor = 0.9;
    else if (lat < 11) latFactor = 1.3;
    else if (lat < 12) latFactor = 1.15;
  }

  let totalRain = 0;
  let daysLeft = cycleDays;
  let currentMonth = startMonth;

  while (daysLeft > 0) {
    const daysInMonth = Math.min(daysLeft, 30);
    const monthRain = (MONTH_DATA[currentMonth]?.rain_mm || 0) * zoneMultiplier * latFactor;
    totalRain += monthRain * (daysInMonth / 30);
    daysLeft -= daysInMonth;
    currentMonth = currentMonth >= 12 ? 1 : currentMonth + 1;
  }

  return totalRain;
}

function isInSowingWindow(month, window) {
  if (window.start <= window.end) {
    return month >= window.start && month <= window.end;
  }
  return month >= window.start || month <= window.end;
}

function getRecommendation(score) {
  if (score >= 80) return { level: 'excellent', text: 'Conditions excellentes pour le semis' };
  if (score >= 60) return { level: 'good', text: 'Conditions favorables, quelques précautions à prendre' };
  if (score >= 40) return { level: 'moderate', text: 'Conditions médiocres — risque élevé, envisagez de reporter' };
  return { level: 'poor', text: 'Conditions défavorables — semis déconseillé ce mois-ci' };
}

// Trouver le meilleur moment de semis dans les 6 prochains mois
function findOptimalSowingDate(crop, city) {
  const cityData = SAHEL_CITIES[city];
  if (!cityData || !CROP_PROFILES[crop]) return null;

  const results = [];
  const currentMonth = new Date().getMonth() + 1;

  for (let i = 0; i < 6; i++) {
    const month = ((currentMonth - 1 + i) % 12) + 1;
    const risk = computeRiskScore(crop, cityData.zone, month, city);
    results.push({ month, monthName: getMonthName(month), ...risk });
  }

  const best = results.reduce((a, b) => a.score > b.score ? a : b);
  const cropProfile = CROP_PROFILES[crop];
  const bestVarieties = cropProfile.varieties.filter(v => zoneMatches(v.zone, cityData.zone));

  return {
    crop: cropProfile.name,
    city,
    zone: cityData.zone,
    currentMonth: { month: currentMonth, name: getMonthName(currentMonth), ...computeRiskScore(crop, cityData.zone, currentMonth, city) },
    optimal: best,
    timeline: results,
    recommendedVarieties: bestVarieties.length > 0 ? bestVarieties : cropProfile.varieties.slice(0, 2),
    cropInfo: {
      cycleDays: cropProfile.cycleDays,
      waterNeeds: cropProfile.waterNeeds,
      optimalTemp: cropProfile.optimalTemp
    }
  };
}

function getMonthName(month) {
  const names = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return names[month];
}

function getAvailableCrops() {
  return Object.entries(CROP_PROFILES).map(([key, profile]) => ({
    id: key,
    name: profile.name,
    cycleDays: profile.cycleDays,
    waterNeeds: profile.waterNeeds
  }));
}

export { findOptimalSowingDate, computeRiskScore, getAvailableCrops, CROP_PROFILES };
