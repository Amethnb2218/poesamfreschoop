/**
 * Tests des routes /api/agro/* (Prediction + Conseiller).
 *
 * Monte handleAgroRequest sur un serveur HTTP nu avec des dependances
 * simulees : pas besoin de base Turso ni de cle LLM. Verifie les codes de
 * statut, la forme des payloads, la coherence agronomique et la protection
 * du conseiller.
 *
 * Usage : node scripts/agro-test.mjs
 */

import { createServer } from 'node:http';
import { handleAgroRequest } from '../server/agro/routes.js';

// --- Dependances simulees, identiques au contrat de server/index.js --------
function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, { 'Content-Type': 'application/json;charset=utf-8' });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

// Accepte uniquement le jeton factice "valide".
function requireAuth(request) {
  const auth = request.headers.authorization || '';
  return auth === 'Bearer jeton-test' ? { uid: 'usr-test', role: 'agriculteur' } : null;
}

// Faux LLM : renvoie une reponse reconnaissable pour distinguer llm / offline.
async function callOpenRouter(_apiKey, model, messages) {
  const last = messages[messages.length - 1]?.content || '';
  return { answer: `[reponse modele] ${last.slice(0, 40)}`, model };
}

const server = createServer((request, response) => {
  handleAgroRequest(request, response, { sendJson, readBody, requireAuth, callOpenRouter })
    .catch((error) => sendJson(response, 500, { error: error.message }));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

// --- Micro-harnais --------------------------------------------------------
let passed = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`  ECHEC ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function get(path, headers = {}) {
  const res = await fetch(base + path, { headers });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function post(path, payload, headers = {}) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// --- Referentiels ---------------------------------------------------------
console.log('\nReferentiels');
{
  const { status, body } = await get('/api/agro/crops');
  check('GET /crops repond 200', status === 200, `statut ${status}`);
  check('/crops renvoie au moins 6 cultures', (body?.crops?.length || 0) >= 6, `recu ${body?.crops?.length}`);
  check('chaque culture porte ses varietes', (body?.crops || []).every((c) => Array.isArray(c.varieties)));
}
{
  const { status, body } = await get('/api/agro/cities');
  const cities = (body?.countries || []).flatMap((g) => g.cities);
  check('GET /cities repond 200', status === 200, `statut ${status}`);
  check('/cities couvre plusieurs pays', (body?.countries?.length || 0) >= 5, `recu ${body?.countries?.length}`);
  check('villes exposees avec id + nom + zone', cities.every((c) => c.id && c.name && c.zone));
  // Regression : ces deux villes etaient proposees dans l'UI de Teranga AI
  // sans exister dans le referentiel, ce qui renvoyait un 404.
  check('dosso presente dans le referentiel', cities.some((c) => c.id === 'dosso'));
  check('kayes presente dans le referentiel', cities.some((c) => c.id === 'kayes'));
}

// --- Coherence du referentiel : toute ville exposee doit etre calculable ---
console.log('\nCoherence referentiel / moteur');
{
  const { body } = await get('/api/agro/cities');
  const cities = (body?.countries || []).flatMap((g) => g.cities);
  const broken = [];
  for (const city of cities) {
    const res = await get(`/api/agro/predict/mil/${city.id}`);
    if (res.status !== 200) broken.push(`${city.id}:${res.status}`);
  }
  check(
    `les ${cities.length} villes du selecteur sont toutes calculables`,
    broken.length === 0,
    broken.join(', '),
  );
}

// --- Fenetre de semis -----------------------------------------------------
console.log('\nFenetre de semis');
{
  const { status, body } = await get('/api/agro/predict/arachide/kaolack');
  check('GET /predict repond 200', status === 200, `statut ${status}`);
  check('mois optimal entre 1 et 12', body?.optimal?.month >= 1 && body?.optimal?.month <= 12, String(body?.optimal?.month));
  check('score borne 0-100', body?.optimal?.score >= 0 && body?.optimal?.score <= 100, String(body?.optimal?.score));
  check('projection sur 6 mois', body?.timeline?.length === 6, `recu ${body?.timeline?.length}`);
  check('le mois optimal est le meilleur de la frise',
    body?.optimal?.score === Math.max(...(body?.timeline || []).map((t) => t.score)));
  check('bilan hydrique fourni', typeof body?.optimal?.waterAnalysis?.needed === 'number');
  check('varietes recommandees non vides', (body?.recommendedVarieties?.length || 0) > 0);
}
{
  // Regression : les zones accentuees ('sahélienne') ne matchaient jamais le
  // referentiel ('sahelienne'), aucune variete de zone n'etait retenue.
  const { body } = await get('/api/agro/predict/arachide/louga');
  const names = (body?.recommendedVarieties || []).map((v) => v.name);
  check('varietes saheliennes correctement associees', names.includes('55-437'), names.join(', '));
}
{
  const { body } = await get('/api/agro/predict/riz/saint_louis');
  const names = (body?.recommendedVarieties || []).map((v) => v.name);
  check('varietes de vallee associees au fleuve', names.some((n) => n.includes('Sahel') || n.includes('ISRIZ')), names.join(', '));
}

// --- Rendement ------------------------------------------------------------
console.log('\nRendement estime');
{
  const { status, body } = await get('/api/agro/yield/arachide/kaolack?month=7');
  check('GET /yield repond 200', status === 200, `statut ${status}`);
  const value = body?.ensemble?.predicted_yield_kg;
  check('rendement strictement positif', value > 0, String(value));
  // Bassin arachidier : la reference DAPSA nationale est ~1100 kg/ha.
  check('rendement arachide plausible (500-2500 kg/ha)', value > 500 && value < 2500, String(value));
  const ci = body?.ensemble?.confidence_interval;
  check('intervalle de confiance encadre la prediction', ci && ci.low <= value && ci.high >= value, JSON.stringify(ci));
  check('source meteo renseignee', typeof body?.weather_source === 'string', body?.weather_source);
  check('mois invalide retombe sur le mois courant', (await get('/api/agro/yield/mil/louga?month=99')).status === 200);
}
{
  // Le rendement doit reagir a la pluviometrie de la zone.
  const sec = await get('/api/agro/yield/mil/louga?month=7');
  const humide = await get('/api/agro/yield/mil/kaolack?month=7');
  check(
    'zone plus arrosee = rendement mil superieur',
    humide.body?.ensemble?.predicted_yield_kg > sec.body?.ensemble?.predicted_yield_kg,
    `louga ${sec.body?.ensemble?.predicted_yield_kg} vs kaolack ${humide.body?.ensemble?.predicted_yield_kg}`,
  );
}

// --- Risque bayesien -----------------------------------------------------
console.log('\nRisque bayesien');
{
  const { status, body } = await get('/api/agro/risk/riz/matam/8');
  check('GET /risk repond 200', status === 200, `statut ${status}`);
  check('score de securite borne 0-100', body?.safetyScore >= 0 && body?.safetyScore <= 100, String(body?.safetyScore));
  check('facteurs de risque exposes', Boolean(body?.factors?.drought_probability));
  check('recommandation textuelle fournie', typeof body?.recommendation === 'string');
}

// --- Calendrier optimise -------------------------------------------------
console.log('\nCalendrier optimise (algorithme genetique)');
{
  const { status, body } = await post('/api/agro/calendar', { crops: ['arachide', 'mil', 'niebe'], city: 'kaolack', parcels: 3 });
  check('POST /calendar repond 200', status === 200, `statut ${status}`);
  check('une ligne par parcelle', body?.calendar?.length === 3, `recu ${body?.calendar?.length}`);
  check('mois de semis valides', (body?.calendar || []).every((c) => c.sowMonth >= 1 && c.sowMonth <= 12));
  check('rendement total agrege', body?.totalPredictedYield > 0, String(body?.totalPredictedYield));
}

// --- Metriques -----------------------------------------------------------
console.log('\nMetriques du modele');
{
  const { status, body } = await get('/api/agro/metrics');
  check('GET /metrics repond 200', status === 200, `statut ${status}`);
  const arachide = body?.models?.arachide;
  check('metriques arachide presentes', Boolean(arachide));
  check('R2 entre 0 et 1', Number(arachide?.r_squared) >= 0 && Number(arachide?.r_squared) <= 1, arachide?.r_squared);
  check('nombre d echantillons renseigne', arachide?.n_samples > 0, String(arachide?.n_samples));
}

// --- Validation des entrees ---------------------------------------------
console.log('\nValidation des entrees');
{
  check('culture inconnue -> 404', (await get('/api/agro/predict/banane/kaolack')).status === 404);
  check('zone inconnue -> 404', (await get('/api/agro/predict/mil/atlantis')).status === 404);
  check('mois hors bornes sur /risk -> 400', (await get('/api/agro/risk/mil/louga/42')).status === 400);
  check('endpoint inconnu -> 404', (await get('/api/agro/inconnu')).status === 404);
  check('calendrier sans culture valide -> 400', (await post('/api/agro/calendar', { crops: ['banane'], city: 'kaolack' })).status === 400);
  check('calendrier sans zone valide -> 404', (await post('/api/agro/calendar', { crops: ['mil'], city: 'atlantis' })).status === 404);
}

// --- Conseiller ----------------------------------------------------------
console.log('\nConseiller agricole');
{
  // Le conseiller relaie vers un LLM facture : il doit exiger un compte.
  const anon = await post('/api/agro/advisor', { message: 'quand semer le mil ?' });
  check('sans jeton -> 401', anon.status === 401, `statut ${anon.status}`);

  const auth = { Authorization: 'Bearer jeton-test' };
  const withKey = await post('/api/agro/advisor', { message: 'quand semer le mil a Louga ?' }, auth);
  check('avec jeton -> 200', withKey.status === 200, `statut ${withKey.status}`);
  check('reponse non vide', (withKey.body?.answer?.length || 0) > 0);
  check('question agronomique detectee', withKey.body?.agronomy === true);

  const empty = await post('/api/agro/advisor', { message: '   ' }, auth);
  check('message vide -> 400', empty.status === 400, `statut ${empty.status}`);

  const platform = await post('/api/agro/advisor', { message: 'ou est ma commande ?' }, auth);
  check('question plateforme non marquee agronomique', platform.body?.agronomy === false);
}

// --- Repli hors-ligne ----------------------------------------------------
console.log('\nRepli hors-ligne du conseiller (sans LLM)');
{
  const offlineServer = createServer((request, response) => {
    // callOpenRouter absent -> askAdvisor doit utiliser le moteur local.
    handleAgroRequest(request, response, { sendJson, readBody, requireAuth })
      .catch((error) => sendJson(response, 500, { error: error.message }));
  });
  await new Promise((resolve) => offlineServer.listen(0, '127.0.0.1', resolve));
  const offlineBase = `http://127.0.0.1:${offlineServer.address().port}`;

  const res = await fetch(offlineBase + '/api/agro/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer jeton-test' },
    body: JSON.stringify({ message: 'que cultiver a Kaolack ?' }),
  });
  const body = await res.json();
  check('repond malgre l absence de LLM', res.status === 200, `statut ${res.status}`);
  check('source marquee hors-ligne', body?.source === 'offline', body?.source);
  check('la fiche zone est bien celle demandee', /kaolack/i.test(body?.answer || ''));
  offlineServer.close();
}

// --- Bilan ---------------------------------------------------------------
server.close();
console.log(`\n${passed} verification(s) reussie(s), ${failures.length} echec(s).`);
if (failures.length) {
  console.error('\nEchecs :');
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log('Moteur agronomique et conseiller conformes.');
