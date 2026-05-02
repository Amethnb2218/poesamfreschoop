# FresCoop - Transformation POESAM

## 1. Audit du projet existant

Le projet actuel est une application React + Vite avec un serveur Node local. L'application principale vit encore dans `src/App.jsx`, qui regroupe routes, composants, logique métier, persistance, exports, authentification et helpers. Le serveur expose une API simple `GET/PUT /api/store` et persiste les données dans `server/data/store.json`.

Routes existantes réutilisées :

- `/` accueil rôle-based
- `/login` authentification
- `/marche` catalogue et panier
- `/produits` publication vendeur
- `/commandes` panier, commandes, conversations
- `/operations` hubs et opérations logistiques
- `/dossiers`, `/attestations`, `/preuves`
- `/utilisateurs`, `/impact`, `/donnees`, `/compte`

Ce qui est réutilisé :

- authentification multi-rôles
- navigation rôle-based
- panier et commandes
- chat et notifications
- exports CSV/JSON/HTML
- dashboards avec indicateurs
- serveur local prêt pour migration API réelle

Dette technique :

- `App.jsx` trop volumineux
- pas encore de séparation claire `domain/data/ui/security`
- API trop générique
- pas de tests automatisés
- permissions encore basées sur routes, pas sur actions
- offline-first encore limité au `localStorage`

## 2. Architecture cible

Structure recommandée :

```txt
src/
  app/
    routes.js
    shell/
  components/
    ui/
    charts/
    lists/
  domain/
    lots/
    orders/
    payments/
    consents/
    economic-profile/
    audit/
  data/
    apiClient.js
    localStore.js
    seedDemo.js
    migrations.js
  pages/
    public/
    app/
  security/
    rbac.js
    permissions.js
  pwa/
    syncQueue.js
    connectivity.js
server/
  routes/
  validators/
  storage/
```

Principe : garder l'existant fonctionnel, puis extraire module par module. La plateforme doit rester utilisable pendant la refonte.

## 3. Sitemap public

- Homepage
- Solution
- Comment ça marche
- Impact
- Acheteurs B2B
- Coopératives & GIE
- Partenaires
- Démo jury
- Équipe
- Contact / candidature pilote

La homepage doit montrer le parcours : entrée lot, froid, IA marché, acheteur, paiement partenaire, preuve économique.

## 4. Sitemap app métier

- Producteur / commerçante : lots, recommandations, paiements reçus, historique, indice explicable, alertes
- Coopérative / GIE : membres, volumes, lots à risque, reversements, réachats, impact, rapports
- Opérateur hub : entrée lot, QR, pesée, photos, capteurs, anomalies, sortie lot, sync
- Acheteur B2B : lots disponibles, réservations, commandes récurrentes, litiges, réachat
- Partenaire finance / assurance : données consenties, flux agrégés, indice explicable, offres
- Admin / conformité : RBAC, consentements, audit logs, sécurité, rétention, exports
- Jury / investisseur : sandbox, vie d'un lot, KPI avant/après, carte hubs, scénarios guidés

## 5. Rôles et permissions

| Rôle | Permissions principales |
| --- | --- |
| Admin | tout voir, modérer, exporter, gérer conformité |
| Producteur / commerçante | gérer ses lots, produits, commandes, preuves, consentements |
| Agent Terrain | confirmer terrain, appeler agriculteur, contacter transporteur, organiser livraison |
| Commerçant B2B | consulter marché, commander, payer, télécharger reçu |
| Coop / GIE | voir membres rattachés, volumes, impact, rapports |
| Opérateur hub | scanner, peser, contrôler qualité, capteurs, dispatch |
| Acheteur B2B | réserver lots, commander, relancer réachats |
| Partenaire | uniquement données consenties et agrégées |
| Client | marché, panier, commandes, messages |
| Transporteur | opérations, livraisons, hubs |

## 6. Modèles de données

Modèles historiques : `User`, `Product`, `Order`, `Message`, `Notification`, `Hub`, `Dossier`, `Attestation`, `Transaction`, `Proof`.

Modèles ajoutés pour FresCoop infrastructure :

- `Cooperative`
- `Crate`
- `Lot`
- `LotPhoto`
- `SensorDevice`
- `SensorReading`
- `QualityAssessment`
- `Buyer`
- `BuyerOrder`
- `Reservation`
- `Dispatch`
- `PaymentRecord`
- `PayoutRecord`
- `ConsentRecord`
- `EconomicProfile`
- `PartnerOffer`
- `Alert`
- `AuditLog`
- `KPIAggregate`

Règle conformité : les paiements sont `partner-powered`. FresCoop ne doit jamais être présenté comme un wallet ou émetteur de monnaie.

## 7. Backlog priorisé

Priorité 1 :

- jumeau numérique du lot
- QR lot
- pesée
- photos qualité
- capteurs température/humidité
- durée de vie commerciale estimée
- recommandation de débouché
- réservation B2B
- paiement partenaire
- preuve économique portable
- KPI impact

Priorité 2 :

- commandes récurrentes
- réachat en un clic
- pooling de caisses
- moteur revenu hub
- referrals assurance / avance
- rapports coopératifs

Priorité 3 :

- prévision demande
- heatmap lots à risque
- audit trail complet
- fiabilité acheteurs
- ESG, pertes évitées, CO2 estimé
- assistant contextualisé par rôle

## 8. Implémentation actuelle

Ajouts déjà intégrés :

- page `/lots` pour jumeaux numériques
- site public accessible sans connexion : `/public`, `/solution`, `/comment-ca-marche`, `/impact-public`, `/acheteurs-b2b`, `/cooperatives-gie`, `/partenaires`, `/demo-jury`, `/equipe`, `/contact`
- rôle `Agent Terrain` pour confirmer les commandes lorsque l'agriculteur n'est pas connecté
- rôle `Commerçant B2B` repositionné comme client professionnel qui commande et paie
- page `/paiement` avec paiement partner-powered et reçu HTML téléchargeable
- notifications après paiement envoyées à l'agriculteur et à l'agent terrain
- workflow agent : agriculteur appelé, transporteur contacté, livraison organisée
- régulation prix marché : prix de référence local + marge maximale configurable de 100 FCFA
- QR visuel de lot
- poids, caisses, chambre froide, température, humidité
- estimation de vie commerciale
- recommandation de débouché
- réservation B2B
- paiement partner-powered
- consentement partenaire révocable
- audit log sur actions sensibles
- dataset démo jury chargeable depuis `/donnees`
- listes de commandes réductibles, masquables, paginées

## 9. Dataset démo

Le dataset démo contient :

- GIE Femmes des Niayes
- Union rizicole du Fouta
- lots oignon, riz, tomate
- hubs froids Thiès et Saint-Louis
- capteurs température/humidité
- acheteurs B2B
- réservations
- paiements partenaires
- consentement Baobab+ Finance agricole
- KPI pertes évitées et gain producteur

## 10. Tests critiques à ajouter

Minimum recommandé :

- login admin et redirection rôle
- RBAC : accès refusé si rôle non autorisé
- panier vers commandes
- masquer/restaurer commandes
- création réservation B2B
- création/révocation consentement
- export JSON
- normalisation store avec nouveaux modèles
- hash mot de passe fallback navigateur

## 11. Déploiement et utilisation

Développement :

```bash
npm install
npm run dev
```

Production locale :

```bash
npm run build
npm run start
```

Compte admin démo :

- email : `amethsl2218@gmail.com`
- mot de passe : `passer123`

Pour charger la démo jury :

1. se connecter admin
2. aller dans `/donnees`
3. cliquer `Charger demo jury`
4. ouvrir `/lots`
