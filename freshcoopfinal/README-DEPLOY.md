# FresCoop Backend - Déploiement

## Prérequis
- Node.js >= 18

## Installation

1. Cloner cette branche :
```bash
git clone -b backend-deploiement <url-du-repo>
cd freshcoopfinal
```

2. Renommer les fichiers :
```bash
mv package-backend.json package.json
mv .gitignore-backend .gitignore
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Puis remplir les vraies clés dans .env
```

4. Lancer le serveur :
```bash
node server/index.js --api-only
```

Le serveur écoute sur le port 4174 par défaut (configurable via `PORT` dans `.env`).

## Endpoints API
- `GET /api/health` — Vérification santé
- `GET /api/store` — Lire le store
- `PUT /api/store` — Sauvegarder le store
- `POST /api/paydunya/create-invoice` — Créer une facture PayDunya
- `GET /api/paydunya/confirm/:token` — Confirmer un paiement
- `POST /api/yaay/chat` — Chat IA FresCoop
- `GET /api/store/backups` — Lister les backups
- `POST /api/store/restore?name=xxx` — Restaurer un backup
