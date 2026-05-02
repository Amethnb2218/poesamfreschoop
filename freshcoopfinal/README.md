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

## Mode production local

```bash
npm run build
npm run start
```

URL application + API: `http://127.0.0.1:4174/`

Au premier lancement, creez le compte admin initial. Les autres comptes se creent ensuite via la page de connexion: agriculteur, commercant, transporteur ou client.

Les donnees applicatives sont persistees dans `server/data/store.json` en local et restent exportables depuis la page Donnees.

## Verifier

```bash
npm run build
```

## Ce que montre la demo

- Cockpit executif pour le pitch.
- Parcours du lot du champ au paiement.
- Optimisation de route de vente selon prix net, demande, confiance et delai.
- Micro-hubs solaires avec capacite, froid, batterie et pertes evitees.
- Passeport economique consentie pour productrices, collectrices et commercantes.
- Simulateur d'impact et modele economique B2B2C.
- Section dossier avec pitch, risques maitrises et usage du financement.
