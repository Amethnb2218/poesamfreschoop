# Frescoop Final POESAM 2026

Projet final fusionne pour le concours POESAM.

Frescoop combine trois briques dans une seule proposition:

- Micro-hubs frigorifiques solaires partages pour reduire les pertes post-recolte.
- Intelligence marche inspiree de Leraal pour orienter les lots vers le meilleur debouche.
- Preuve economique portable inspiree de ECONO-ID AFRICA pour rendre les transactions lisibles par des partenaires agrees.

## Lancer

```bash
npm install
npm run dev
```

URL locale Vite: `http://127.0.0.1:5173/`

Le script `dev` lance aussi l'API locale FresCoop sur `http://127.0.0.1:4174/api`.

Aucun identifiant cloud n'est necessaire pour demarrer en local : sans
`TURSO_DATABASE_URL`, le serveur persiste sur un fichier SQLite local
(`server/data/frescoop.db`, ignore par git). Copiez `.env.example` en `.env`
pour renseigner les cles optionnelles. En production (`NODE_ENV=production`),
les identifiants Turso redeviennent obligatoires.

## Mode production local

```bash
npm run build
npm run start
```

URL application + API: `http://127.0.0.1:4174/`

Au premier lancement, creez le compte admin initial. Les autres comptes se creent ensuite via la page de connexion: agriculteur, commercant, transporteur ou client.

Les donnees applicatives sont persistees dans `server/data/store.json` en local et restent exportables depuis la page Donnees.

## Prediction agronomique et Conseiller agricole

Deux pages dediees a la decision de culture, alimentees par `server/agro/` :

- **Prediction** (`/prediction`) : fenetre de semis optimale sur 6 mois, bilan
  hydrique, risques climatiques, reseau bayesien de securite, rendement estime
  avec intervalle de confiance, et varietes ISRA adaptees a la zone.
- **Conseiller** (`/conseiller`) : chat agronomique en 4 langues sur les
  cultures, sols, engrais, ravageurs et calendrier cultural.

Le moteur de prediction est **entierement local** : regression ridge, k plus
proches voisins, ensemble a ponderation dynamique, algorithme genetique pour le
calendrier et reseau bayesien pour le risque, valides en LOOCV sur des donnees
FAOSTAT, DAPSA, ISRA et ANACIM. Aucune cle API n'est requise.

Le conseiller utilise OpenRouter quand `OPENROUTER_API_KEY` est definie, et
retombe sur un moteur de reponses local sinon — il reste donc utilisable
hors-ligne. `OPENWEATHER_API_KEY` est optionnelle : si elle est presente, la
meteo temps reel remplace les moyennes climatiques dans le calcul du rendement.

Endpoints : `/api/agro/cities`, `/api/agro/crops`, `/api/agro/predict/:crop/:city`,
`/api/agro/yield/:crop/:city?month=`, `/api/agro/risk/:crop/:city/:month`,
`/api/agro/metrics`, `POST /api/agro/calendar`, `POST /api/agro/advisor`
(authentifie, quota dedie).

## Verifier

```bash
npm run build
npm run test:agro
```

`test:agro` couvre les routes agronomiques et le conseiller sans necessiter de
base de donnees ni de cle LLM (52 verifications).

## Ce que montre la demo

- Cockpit executif pour le pitch.
- Parcours du lot du champ au paiement.
- Optimisation de route de vente selon prix net, demande, confiance et delai.
- Micro-hubs solaires avec capacite, froid, batterie et pertes evitees.
- Passeport economique consentie pour productrices, collectrices et commercantes.
- Simulateur d'impact et modele economique B2B2C.
- Section dossier avec pitch, risques maitrises et usage du financement.
