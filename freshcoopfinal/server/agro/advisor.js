/**
 * Conseiller agronomique FresCoop
 * ---------------------------------------------------------------------------
 * Porte la logique du conseiller de Teranga AI dans FresCoop, sans dependance
 * a un service externe :
 *   - prompt systeme agronomique Sahel (prompts.js)
 *   - fiches zone + reponses hors-ligne (offline-responses.js)
 *   - degradation gracieuse : si aucune cle LLM n'est configuree, on repond
 *     quand meme via le moteur de mots-cles local.
 *
 * Le LLM utilise est OpenRouter, deja configure pour l'assistant FresCoop
 * (OPENROUTER_API_KEY) : aucune nouvelle cle a provisionner.
 */

import { getSystemPrompt } from './prompts.js';
import { OFFLINE_RESPONSES } from './offline-responses.js';

// ---------------------------------------------------------------------------
// Fiches zone (Senegal) — utilisees pour les reponses hors-ligne ciblees
// ---------------------------------------------------------------------------
const ZONE_DATA = {
  dakar: { zone: 'Niayes', cultures: 'tomate, oignon, chou, piment, salade', sol: 'sablonneux riche (Niayes)', pluviometrie: '400mm', irrigation: 'nappe phreatique accessible', conseil: "Zone maraichere par excellence. Culture toute l'annee avec irrigation. Privilegiez les legumes a haute valeur (tomate, oignon, piment)." },
  thies: { zone: 'Bassin arachidier / Niayes', cultures: 'arachide, mil, pasteque, manioc', sol: 'Dior (sablonneux)', pluviometrie: '500mm', conseil: 'Bonne zone pour arachide variete 55-437 (cycle court). Association mil+niebe recommandee.' },
  kaolack: { zone: 'Bassin arachidier (coeur)', cultures: 'arachide, mil, niebe, mais', sol: 'Dior/Deck', pluviometrie: '700mm', conseil: "Capitale de l'arachide. Varietes 55-437 et 73-33 tres adaptees. Rotation arachide vers mil essentielle." },
  fatick: { zone: 'Sine Saloum', cultures: 'arachide, mil, riz pluvial, sel', sol: 'Deck (argilo-sableux)', pluviometrie: '650mm', conseil: 'Zone mixte agriculture/peche. Riz dans les bas-fonds, arachide sur les plateaux.' },
  diourbel: { zone: 'Bassin arachidier', cultures: 'arachide, mil, niebe, pasteque', sol: 'Dior', pluviometrie: '550mm', conseil: "Zone importante pour l'arachide. Sol leger, privilegiez fumure organique (5-10t/ha)." },
  kaffrine: { zone: 'Bassin arachidier sud', cultures: 'arachide, mil, mais, sesame, niebe', sol: 'Deck', pluviometrie: '750mm', conseil: 'Bonne pluviometrie pour mais et arachide de bouche (73-33). Zone en expansion.' },
  saint_louis: { zone: 'Fleuve', cultures: 'riz irrigue, tomate industrielle, oignon', sol: 'Hollalde (argileux)', pluviometrie: '300mm mais irrigue', irrigation: 'Fleuve Senegal', conseil: 'Riz irrigue 2 campagnes/an (Sahel 108, Sahel 202). Rendements 6-8t/ha possibles.' },
  matam: { zone: 'Fleuve (haute vallee)', cultures: 'riz irrigue, mil, sorgho, maraichage', sol: 'Hollalde / Dieri', pluviometrie: '400mm', conseil: 'Riz en walo (inondation), mil et sorgho sur le dieri. Tres chaud, varietes resistantes chaleur obligatoires.' },
  louga: { zone: 'Sylvo-pastorale', cultures: 'mil, niebe, arachide (cycle court), elevage', sol: 'Dior leger', pluviometrie: '350mm', conseil: 'Zone seche. Mil IBV 8004 (75j) et niebe Melakh (60j) indispensables. Elevage dominant.' },
  tambacounda: { zone: 'Senegal oriental', cultures: 'mais, arachide, coton, sorgho, sesame', sol: 'Ferrugineux / Deck', pluviometrie: '800mm', conseil: 'Bonne pluviometrie. Zone de diversification (coton, sesame, anacarde). Mais SWAN excellent.' },
  kedougou: { zone: 'Senegal oriental sud', cultures: 'mais, riz pluvial, fonio, arachide, anacarde', sol: 'Ferrugineux profond', pluviometrie: '1100mm', conseil: 'Plus forte pluviometrie apres la Casamance. Idelae pour riz pluvial NERICA, fonio et vergers (mangue, anacarde).' },
  ziguinchor: { zone: 'Basse Casamance', cultures: 'riz pluvial, mais, arachide, huile de palme, anacarde', sol: 'Ferralitique / mangrove', pluviometrie: '1300mm', conseil: 'Grenier a riz du Senegal. NERICA 4 et WAR 77 tres productifs. Potentiel arboriculture (anacarde, mangue, agrumes).' },
  kolda: { zone: 'Haute Casamance', cultures: 'arachide, mais, riz, mil, coton', sol: 'Ferrugineux / Deck', pluviometrie: '1000mm', conseil: 'Zone polyvalente. Arachide de bouche (GC 8-35), mais JDB et riz pluvial. Bonne productivite.' },
  sedhiou: { zone: 'Moyenne Casamance', cultures: 'arachide, riz, anacarde, mais', sol: 'Ferralitique', pluviometrie: '1100mm', conseil: 'Zone emergente pour anacarde (noix de cajou). Riz de bas-fond tres productif. Arachide GC 8-35.' },
};

const CITY_PATTERN = /\b(dakar|thies|thi[eè]s|kaolack|saint.?louis|tambacounda|tamba|ziguinchor|zigui|kolda|fatick|louga|matam|kedougou|k[eé]dougou|sedhiou|s[eé]dhiou|diourbel|kaffrine)\b/i;

function canonicalCity(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace('thiès', 'thies')
    .replace('tamba', 'tambacounda')
    .replace('zigui', 'ziguinchor')
    .replace('kédougou', 'kedougou')
    .replace('sédhiou', 'sedhiou')
    .replace(/saint.?louis/, 'saint_louis');
}

/**
 * Moteur hors-ligne : associe un message a une fiche zone ou a une reponse
 * thematique pre-redigee. Sert de filet quand le LLM est indisponible.
 */
export function matchOfflineResponse(userMessage) {
  const msg = String(userMessage || '').toLowerCase().trim();

  if (/^(bonjour|salut|bonsoir|hello|hi|hey|salam|na nga def|assalamou|nanga def)/.test(msg)) {
    return OFFLINE_RESPONSES.bonjour;
  }

  const cityMatch = msg.match(CITY_PATTERN);
  const cityName = canonicalCity(cityMatch?.[1]);
  if (cityName && ZONE_DATA[cityName]) {
    const z = ZONE_DATA[cityName];
    const asksWhatToGrow = /culti|semer|planter|quoi|que faire|conseil|zone|r[eé]gion/.test(msg);
    if (asksWhatToGrow) {
      const label = cityName.charAt(0).toUpperCase() + cityName.slice(1).replace('_', ' ');
      return [
        `**Conseils agricoles pour ${label}** (zone ${z.zone})`,
        '',
        `**Cultures adaptees :** ${z.cultures}`,
        `**Sol :** ${z.sol}`,
        `**Pluviometrie :** ${z.pluviometrie}/an`,
        z.irrigation ? `**Irrigation :** ${z.irrigation}` : '',
        '',
        `**Conseil :** ${z.conseil}`,
        '',
        '**A faire maintenant :**',
        '- Preparer vos parcelles (labour 15-20cm)',
        '- Acheter des semences certifiees ISRA',
        '- Retirer les engrais subventionnes au point de vente agree',
      ]
        .filter(Boolean)
        .join('\n');
    }
  }

  const rules = [
    [/arachide|gerte/, 'arachide'],
    [/tomate|tamaat/, 'tomate'],
    [/\bmil\b|souna|dugub/, 'mil'],
    [/irrig|arros|goutte/, 'irrigation'],
    [/oignon|soupou/, 'oignon'],
    [/maladie|insecte|puceron|parasite|chenille|ravageur/, 'maladies'],
    [/prix|march[eé]|vendre/, 'marche'],
    [/\briz\b|maalo/, 'riz'],
    [/ma[iï]s|mboq/, 'mais'],
    [/ni[eé]b[eé]|nebe/, 'niebe'],
    [/semer|semis|quand planter|calendrier/, 'calendrier'],
    [/engrais|fertilis|npk|ur[eé]e|fumier|compost/, 'engrais'],
    [/\bsol\b|terre|dior|deck|hollal/, 'sols'],
    [/cr[eé]dit|financement|pr[eê]t|banque|\bder\b/, 'financement'],
    [/climat|s[eé]cheresse|adaptation/, 'climat'],
    [/pluie|hivernage|saison|maintenant|quand/, 'saison'],
  ];

  for (const [pattern, key] of rules) {
    if (pattern.test(msg) && OFFLINE_RESPONSES[key]) return OFFLINE_RESPONSES[key];
  }

  return OFFLINE_RESPONSES.default;
}

// ---------------------------------------------------------------------------
// Detection des questions agronomiques
// ---------------------------------------------------------------------------
const AGRI_PATTERN = /\b(cultiver|culture|semer|semis|planter|r[eé]colte|rendement|sol|terre|engrais|fumier|compost|irrigation|arroser|vari[eé]t[eé]|maladie|insecte|parasite|ravageur|chenille|puceron|m[eé]t[eé]o|pluie|pluviom[eé]trie|hivernage|saison|calendrier|parcelle|hectare|jach[eè]re|rotation|arachide|mil|riz|ma[iï]s|ni[eé]b[eé]|tomate|oignon|mangue|anacarde|coton|sorgho|fonio|past[eè]que|manioc|gerte|dugub|maalo|nawet|taw|ndox|tool|mbey|suuf|noong|ngesa)\b/i;

export function isAgronomyQuestion(message) {
  return AGRI_PATTERN.test(String(message || ''));
}

// ---------------------------------------------------------------------------
// Contexte FresCoop injecte dans le prompt
// ---------------------------------------------------------------------------
function buildAdvisorPrompt(language, context = {}) {
  const base = getSystemPrompt(language);
  const lines = ['', 'CONTEXTE FRESCOOP :', "Tu reponds depuis FresCoop, plateforme senegalaise qui relie productrices, commercantes et acheteurs B2B (micro-hubs solaires, tracabilite des lots, preuve economique pour le credit)."];

  if (context.userName) lines.push(`Utilisateur : ${context.userName}${context.userRole ? ` (role ${context.userRole})` : ''}.`);
  if (context.region) lines.push(`Region declaree : ${context.region}.`);
  if (context.crop) lines.push(`Culture consultee dans l'app : ${context.crop}.`);
  if (context.city) lines.push(`Zone consultee dans l'app : ${context.city}.`);

  lines.push(
    "Quand la question touche la vente, le prix, le paiement ou le score de bancabilite, renvoie vers la page FresCoop concernee au lieu d'improviser.",
    "N'invente jamais de chiffre sur l'activite du compte : ceux affiches dans l'app sont la reference.",
  );

  return `${base}\n${lines.join('\n')}`;
}

/**
 * Appelle le conseiller. `callLlm` est injecte par le serveur pour reutiliser
 * son client OpenRouter (et rester testable sans reseau).
 *
 * @returns {Promise<{answer: string, source: 'llm'|'offline', model?: string}>}
 */
export async function askAdvisor({ message, language = 'fr', context = {}, history = [], callLlm }) {
  const clean = String(message || '').trim();
  if (!clean) {
    return { answer: OFFLINE_RESPONSES.default, source: 'offline' };
  }

  if (typeof callLlm === 'function') {
    try {
      const messages = [
        { role: 'system', content: buildAdvisorPrompt(language, context) },
        ...(Array.isArray(history) ? history : [])
          .slice(-6)
          .map((h) => ({
            role: h.from === 'user' || h.role === 'user' ? 'user' : 'assistant',
            content: String(h.text || h.content || '').slice(0, 500),
          }))
          .filter((m) => m.content),
        { role: 'user', content: clean.slice(0, 1000) },
      ];

      const result = await callLlm(messages);
      const answer = String(result?.answer || '').trim();
      if (answer) {
        return { answer, source: 'llm', model: result.model };
      }
    } catch (error) {
      console.error('[Conseiller] LLM indisponible:', error?.message || error);
    }
  }

  return { answer: matchOfflineResponse(clean), source: 'offline' };
}

export { ZONE_DATA };
