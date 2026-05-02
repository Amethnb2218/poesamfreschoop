# FresCoop Mobile — POESAM 2026

Version application mobile native de la plateforme FresCoop (iOS + Android).

Construite avec **Expo** + **React Native** + **expo-router** + **TypeScript**.
Se connecte à l'API Node locale du site (`freshcoopfinal/server`) pour partager
les comptes, les lots, les hubs, les produits et les commandes.

## Lancer en dev

```bash
npm install
npm run start
```

Scanner le QR code avec **Expo Go** (iOS/Android).

> L'API du site doit tourner en parallèle :
> ```bash
> cd ../freshcoopfinal
> npm run dev
> ```
> L'API écoute sur `0.0.0.0:4174`, donc accessible depuis le téléphone.

## Configurer l'URL API

Par défaut l'app détecte automatiquement l'IP LAN du bundler Metro et appelle
`http://<ip-bureau>:4174`. Pour forcer une URL :

```bash
# .env à la racine
EXPO_PUBLIC_API_URL=http://192.168.1.42:4174
```

## Structure

```
app/
  _layout.tsx          # SessionProvider + Stack racine
  auth/                # login + inscription (rôles multiples)
  (tabs)/
    index.tsx          # Cockpit (KPI, commandes récentes, produits)
    market.tsx         # Marché (recherche + filtres catégories)
    lots.tsx           # Lots avec statut
    hubs.tsx           # Micro-hubs solaires (temp/batterie/pertes)
    profile.tsx        # Profil + déconnexion
components/
  Brand, Button, Card, Input, StatPill
context/
  SessionContext.tsx   # login/register/store synchronisés avec l'API
lib/
  api.ts               # fetch + hashPassword SHA-256 compatibles avec le site
constants/
  theme.ts             # palette Frescoop extraite de styles.css
```

## Partage de comptes avec le site

Le hash de mot de passe (SHA-256 hex) est **identique** au site web :
vous pouvez vous connecter depuis l'app mobile avec le même e-mail/mot de
passe que sur le site, et réciproquement. Les comptes créés depuis l'app
apparaissent dans l'admin du site.
