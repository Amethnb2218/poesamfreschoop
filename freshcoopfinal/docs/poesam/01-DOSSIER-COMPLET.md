# FresCoop
## Dossier de candidature POESAM 2026

**Catégorie** : Entrepreneuriat social à impact — Agritech & Inclusion financière
**Thème 2026 ciblé** : IA, Data, Cybersécurité au service du développement durable
**Pays** : Sénégal → scalable 17 pays du footprint Orange
**Tagline** : *Du champ au marché, la preuve qui paie*

---

## 1. Présentation du projet

### 1.1 Identité
**FresCoop** est une plateforme numérique sénégalaise qui transforme la chaîne agricole post-récolte en un écosystème transparent, financé et mesurable. Elle connecte producteurs, hubs froids, acheteurs B2B et partenaires financiers autour d'un **jumeau numérique** de chaque lot agricole : QR de traçabilité, capteurs IoT, IA prédictive de durée de vie, paiement digital sécurisé et score de bancabilité temps réel.

### 1.2 Vision
Faire du petit producteur sénégalais un **acteur bancable**, dont chaque kilo vendu devient une preuve économique exploitable par les banques et SFD. À l'horizon 5 ans, FresCoop vise à couvrir 50 000 producteurs dans 6 pays UEMOA.

### 1.3 Proposition de valeur synthétique

| Pour qui | Gain tangible |
|---|---|
| **Agriculteur** | +18 % de revenu net, −30 % de pertes, accès au crédit sans paperasse |
| **Acheteur B2B** | Sourcing traçable, prix cassé anti-gaspi, argument RSE |
| **Partenaire finance** | Portefeuille agri scoré automatiquement, zéro papier |
| **Transporteur** | Tournées optimisées par urgence DLC |
| **Autorité publique** | Données temps réel sur volumes, pertes, femmes productrices |

### 1.4 Maturité actuelle
- MVP fonctionnel déployable (React + Node + API)
- Intégration PayDunya opérationnelle (Orange Money, Wave, CB)
- 7 rôles métiers avec flux différenciés
- PWA installable, mode hors-ligne, multilangue wolof/pulaar/sérère
- Prêt pour pilote terrain sous 30 jours

---

## 2. Problème ciblé

### 2.1 Diagnostic chiffré du contexte sénégalais

**Les pertes post-récolte** au Sénégal atteignent **30 à 50 %** pour les fruits et légumes frais (Banque mondiale, 2024). Principaux segments touchés : horticulture, céréales, denrées animales périssables (FAO, 2023).

**Le coût économique** représente plus de **300 milliards FCFA perdus chaque année** à l'échelle nationale, soit l'équivalent de 2 % du PIB agricole.

### 2.2 Causes structurelles identifiées

1. **Absence de chaîne du froid** accessible : seulement 12 % des coopératives disposent de moyens de stockage réfrigéré (ANSD, 2022)
2. **Coût de l'électricité élevé** qui freine le développement de hubs froids compétitifs (Banque mondiale)
3. **Informalité de la vente** : 78 % des transactions agricoles se font en espèces, sans trace
4. **Exclusion financière** : 55 % des adultes ruraux n'ont pas de compte bancaire (Findex 2022)
5. **Fracture numérique** : 70 % des petits producteurs utilisent encore des téléphones à touches (2G)

### 2.3 Conséquences humaines
- Une agricultrice des Niayes perd en moyenne **40 000 FCFA/mois** en stock pourri
- Elle ne peut pas prouver ses revenus → refus systématique au crédit bancaire
- Elle subit les prix des intermédiaires (bana-bana) sans alternative
- Ses enfants paient le prix de cette volatilité

### 2.4 Pourquoi maintenant ?
- **AgriConnect Sénégal** (Banque mondiale, février 2026) cible exactement horticulture / grains / élevage
- **Mobile money** atteint 45 % d'adoption (GSMA, 2023) — infrastructure prête
- **Politique publique** : Nouveau Ministère de l'Agriculture prône la digitalisation de la filière
- **Demande B2B** en explosion : hôtels, restaurants, transformateurs cherchent du traçable

---

## 3. Solution

### 3.1 L'écosystème FresCoop en 4 piliers

#### 🌾 Pilier 1 — Traçabilité froid intelligente
Chaque lot reçoit un **jumeau numérique** : QR code unique, capteurs IoT de température/humidité, photos qualité horodatées, timeline complète du champ au marché. L'IA prédit la durée de vie commerciale restante.

#### 🍅 Pilier 2 — Anti-gaspillage automatique
Le moteur FresCoop détecte les lots à DLC courte et propose automatiquement :
- Alerte push à l'agriculteur
- Prix dégressif (-15 % à -40 %) appliqué en un clic
- Notification aux acheteurs B2B les plus proches géographiquement
- Échos du gagnant 2024 SAVEY (Maroc, Grand Prix International)

#### 💳 Pilier 3 — Paiement digital sécurisé
Intégration **PayDunya** (Orange Money, Wave, Free Money, carte bancaire). FresCoop ne détient aucun wallet — conformité totale. Reçu numérique avec **QR de vérification publique** authentifiable via `frescoop.sn/verifier?code=XXX`.

#### 🏦 Pilier 4 — Bancabilité & inclusion financière
Score de bancabilité 0-100 (grade A/B/C/D) calculé en temps réel sur 7 critères : ancienneté, transactions vérifiées, paiements digitaux, lots tracés, attestations, preuves économiques, revenu moyen mensuel. **Export PDF** exploitable par banques/SFD avec code de vérification.

### 3.2 Innovations distinctives

| Innovation | Originalité |
|---|---|
| **Assistant IA multilangue "Yaay"** | Conseil agricole en wolof, pulaar, sérère, français. 24h/24. |
| **USSD `*384*FRES#`** | Accès plateforme depuis téléphone 2G à touches. 70% de la cible couverte. |
| **PWA offline-first** | App fonctionne sans réseau grâce au service worker + localStorage. Sync auto au retour. |
| **Jumeau numérique IoT** | Chaîne du froid mesurée, pas déclarée. |
| **Score bancabilité automatique** | Pont agri → finance, rarement combiné. |

### 3.3 Architecture technique
- **Frontend** : React 19, Vite 7, PWA, 7 interfaces métier adaptatives
- **Backend** : Node.js avec API REST, persistance JSON, intégration PayDunya sandbox/live
- **Sécurité** : Hash bcrypt (roadmap), tokens PayDunya, QR vérification signée
- **Scalabilité** : Prêt pour migration PostgreSQL + Redis + Kubernetes
- **Conformité** : RGPD Sénégal, consentement explicite sur données

---

## 4. Marché et concurrence

### 4.1 Taille du marché

**Marché adressable (TAM)** : 17 pays du footprint Orange, **400+ millions d'habitants**, dont 60 % en zone rurale.

**Marché accessible (SAM)** : UEMOA (8 pays), **130 millions d'habitants**, agriculture = 30 % du PIB régional.

**Marché atteignable (SOM) à 3 ans** : Sénégal + Mali + Côte d'Ivoire, **~5 000 producteurs actifs** et 300 acheteurs B2B.

### 4.2 Concurrence

| Acteur | Segment | Limite |
|---|---|---|
| **Coliba** (Côte d'Ivoire) | Collecte déchets | N'adresse pas post-récolte |
| **AgriEdge** (Maroc) | Analyse satellitaire | Trop technique pour petits producteurs |
| **Manobi** (Sénégal) | Information marché | Pas de paiement ni bancabilité intégrée |
| **M-Louma** (Sénégal) | Marketplace agri | Pas de traçabilité froid ni scoring crédit |
| **SAVEY** (Maroc, POESAM 2024) | Anti-gaspi restaurants | B2C urbain uniquement |

### 4.3 Avantage compétitif FresCoop

FresCoop est **le seul acteur** à combiner les 4 piliers (traçabilité IoT + anti-gaspi + paiement digital + bancabilité) dans **un écosystème intégré pour petits producteurs sénégalais**.

**Barrières à l'entrée construites** :
- Partenariat PayDunya opérationnel
- Couverture linguistique unique (4 langues)
- Data propriétaire sur scoring crédit agri
- Déploiement USSD possible via Sonatel

---

## 5. Business model

### 5.1 Revenus multi-source

| Flux | Mécanique | Part du CA an 3 |
|---|---|---|
| **Commission transactionnelle** | 2 % sur GMV B2B | 60 % |
| **Abonnement SaaS hubs froids** | 15 000 FCFA/mois/hub | 15 % |
| **Fee partenaires finance** | 2 500 FCFA par dossier de bancabilité consulté | 15 % |
| **Marketplace ads (anti-gaspi)** | Promotion lots urgents | 5 % |
| **Data services B2B** | Agrégats anonymisés (prix marché, stocks) | 5 % |

### 5.2 Économie unitaire (Unit economics)

| Indicateur | An 1 | An 2 | An 3 |
|---|---|---|---|
| GMV orchestré | 250 M FCFA | 850 M FCFA | 2,2 Md FCFA |
| Take rate moyen | 7,2 % | 7,3 % | 6,7 % |
| Revenus FresCoop | **18 M FCFA** | **62 M FCFA** | **148 M FCFA** |
| Coûts opérationnels | 45 M FCFA | 70 M FCFA | 105 M FCFA |
| EBITDA | −27 M FCFA | −8 M FCFA | **+43 M FCFA** |
| Break-even | M18 | — | — |

### 5.3 Coûts principaux
- Équipe (dev, terrain, commercial) : 55 %
- Infrastructure capteurs + hubs pilotes : 25 %
- Marketing & acquisition : 10 %
- Conformité, audit, mesure impact : 10 %

---

## 6. Équipe

> *Note : section à personnaliser par le porteur. Voici le template recommandé.*

### 6.1 Porteur principal
**Mouhamed SALL** — Fondateur & CEO
- **Formation** : Diplôme d'Ingénieur Technologue en Génie Logiciel et Systèmes d'Informations — **École Supérieure Polytechnique de Dakar (ESP)**
- **Spécialisation** : Formation AWS Cloud — **Orange Digital Center Sénégal** (écosystème partenaire du POESAM)
- **Expertise technique** : architecture logicielle, cloud AWS, développement full-stack web/mobile, intégrations API paiement (PayDunya opérationnel)
- **Rôle** : Vision produit, architecture technique, partenariats stratégiques, représentation institutionnelle
- **Motivation** : Issu du terrain sénégalais, formé par les deux institutions les plus solides du pays en ingénierie (ESP + Orange Digital Center), il a choisi de mettre cette double compétence tech + cloud au service des petits producteurs agricoles qui restent exclus du circuit digital.
- **Contact** : amethsl2218@gmail.com · +221 77 676 27 84

### 6.2 Équipe fondatrice envisagée (à consolider)
| Profil | Mission | Statut |
|---|---|---|
| CTO / Lead Dev | Architecture technique, scalabilité | Recrutement en cours |
| Responsable terrain | Déploiement coopératives, agents | Recrutement en cours |
| Data / IA Lead | Moteur scoring, anti-gaspi prédictif | Advisor identifié |
| Responsable commercial B2B | Hôtels, restaurants, transformateurs | À recruter post-POESAM |

### 6.3 Conseillers (advisors)
- **Agronome** : expert post-récolte ISRA/FAO
- **Avocat** : spécialiste réglementation BCEAO / RGPD
- **Ancien cadre banque agri** : validation scoring bancabilité

### 6.4 Partenaires stratégiques ciblés
- **Sonatel / Orange** — passerelle USSD, hébergement
- **PayDunya** — paiement (déjà intégré)
- **ISRA** — validation scientifique durée de vie
- **GIE Femmes des Niayes** — pilote terrain
- **Cofina / PAMECAS / Baobab** — SFD partenaires financement

---

## 7. Stratégie de croissance

### 7.1 Phase 1 — Pilote terrain validé (Mois 1 à 6)
**Objectif** : 50 producteurs actifs au Sénégal, 500 transactions réelles
- Déploiement dans 2 zones : Niayes (horticulture) + Saint-Louis (riz)
- 1 hub froid pilote (partenariat coopérative)
- 5 acheteurs B2B ancres (hôtels Dakar)
- Mesure d'impact baseline : pertes évitées, revenu additionnel

### 7.2 Phase 2 — Scale national (Mois 7 à 18)
**Objectif** : 1 500 producteurs, 50 acheteurs B2B, 3 hubs
- Expansion Thiès, Kaolack, Ziguinchor
- Intégration SFD partenaires (scoring opérationnel)
- Lancement USSD en production (accord Sonatel)
- 10 agents terrain formés

### 7.3 Phase 3 — Expansion régionale (Mois 19 à 36)
**Objectif** : 5 000 producteurs, 3 pays UEMOA
- Réplication Mali (riz, mil) et Côte d'Ivoire (maraîchage)
- Partenariats bancaires régionaux (Coris Bank, Ecobank)
- Levée de fonds Seed (300-500 M FCFA)

### 7.4 Vision 5 ans
- 50 000 producteurs actifs
- 6 pays UEMOA
- 10 Md FCFA de GMV orchestré annuel
- Série A envisagée (2-5 M€)

### 7.5 Canaux d'acquisition
- **Coopératives & GIE** (B2B2C) : 1 onboarding = 50+ producteurs
- **Agents terrain rémunérés à la performance** : commission 1 % des transactions
- **Référencement USSD Sonatel** : visibilité auprès des 4 millions d'abonnés ruraux
- **Bouche-à-oreille digital** (Yaay AI multilangue)

---

## 8. Impact social et environnemental

### 8.1 Indicateurs mesurés en temps réel sur la plateforme

| KPI | Baseline | Cible an 1 | Cible an 3 |
|---|---|---|---|
| **Pertes post-récolte évitées (%)** | 30 % | 15 % | 8 % |
| **Revenu additionnel moyen / producteur (FCFA/an)** | 0 | 180 000 | 420 000 |
| **Femmes productrices actives** | 0 | 300 | 3 000 |
| **CO₂ évité (tonnes/an)** | 0 | 120 | 1 800 |
| **Kg tracés annuellement** | 0 | 1,2 M | 18 M |
| **Agriculteurs bancarisés** | 0 | 80 | 1 500 |

### 8.2 Alignement sur les ODD (Objectifs de Développement Durable)

| ODD | Contribution directe |
|---|---|
| **ODD 1** — Pas de pauvreté | Revenu additionnel, inclusion financière |
| **ODD 2** — Faim zéro | Réduction pertes post-récolte, qualité alimentaire |
| **ODD 5** — Égalité des sexes | Femmes productrices visibilisées, crédit facilité |
| **ODD 8** — Travail décent | Preuves économiques bancarisables, emplois locaux (agents) |
| **ODD 12** — Consommation responsable | Traçabilité, anti-gaspillage transparent |
| **ODD 13** — Action climat | CO₂ évité par logistique optimisée et pertes réduites |

### 8.3 Méthodologie d'évaluation d'impact
- **Baseline** mesurée avant onboarding (questionnaire + 1 semaine de suivi)
- **Tableau de bord temps réel** : KPI calculés à partir de toutes les transactions
- **Audit externe annuel** par un cabinet indépendant (cible : ONU Femmes ou 60 Decibels)
- **Rapport d'impact trimestriel** publié publiquement
- **Consentement explicite** des producteurs (RGPD compliant)

### 8.4 Impact femmes spécifique
Les femmes représentent **72 % des membres du GIE Femmes des Niayes**. La plateforme inclut :
- Indicateur « femmes productrices actives »
- Badge valorisant sur le profil
- Priorité pré-approbation dans le scoring (critère social)
- Éligibilité au **Prix Féminin International POESAM** (20 000 €)

---

## 9. Prévisions financières sur 3 ans

### 9.1 Compte de résultat prévisionnel (FCFA)

| Poste | An 1 | An 2 | An 3 |
|---|---|---|---|
| **Producteurs actifs** | 600 | 1 800 | 5 000 |
| **Acheteurs B2B actifs** | 40 | 120 | 300 |
| **GMV orchestré** | 250 000 000 | 850 000 000 | 2 200 000 000 |
| **Take rate moyen** | 7,2 % | 7,3 % | 6,7 % |
| **Chiffre d'affaires** | **18 000 000** | **62 000 000** | **148 000 000** |
| — Commission transactionnelle | 10 800 000 | 38 440 000 | 88 800 000 |
| — SaaS hubs froids | 2 700 000 | 9 300 000 | 22 200 000 |
| — Fee partenaires finance | 2 700 000 | 9 300 000 | 22 200 000 |
| — Ads & data services | 1 800 000 | 4 960 000 | 14 800 000 |
| **Charges opérationnelles** | 45 000 000 | 70 000 000 | 105 000 000 |
| — Salaires & freelance | 25 000 000 | 40 000 000 | 58 000 000 |
| — Infrastructure & capteurs | 12 000 000 | 15 000 000 | 22 000 000 |
| — Marketing & acquisition | 5 000 000 | 8 000 000 | 12 000 000 |
| — Conformité, audit, impact | 3 000 000 | 7 000 000 | 13 000 000 |
| **EBITDA** | **−27 000 000** | **−8 000 000** | **+43 000 000** |
| Marge EBITDA | n/a | −13 % | +29 % |

### 9.2 Break-even
- **Atteint au mois 18** (mi-année 2) avec ~1 200 producteurs actifs
- Sensibilité : un retard de 6 mois sur le take rate décalerait le break-even à M24

### 9.3 Besoin de financement total
**75 M FCFA sur 3 ans**, dont :
- **5 M FCFA — Prix POESAM** (catalyseur prioritaire)
- 30 M FCFA — Pilote + série pre-seed (mois 6-12)
- 40 M FCFA — Seed régional (mois 24)

### 9.4 Hypothèses clés
- Acquisition producteur : 12 000 FCFA (via coopératives, mutualisé)
- Panier moyen B2B : 95 000 FCFA
- Fréquence d'achat B2B : 3,2 par mois
- Churn annuel producteur : < 15 % (grâce au scoring qui incite à la fidélité)

*Hypothèses volontairement conservatrices. Documentation détaillée disponible sur demande (modèle Excel).*

---

## 10. Utilisation du financement POESAM

Sur le prix national Sénégal (3 à 5 M FCFA), l'allocation indicative est la suivante :

| Poste | Part | Montant (sur 5 M FCFA) | Finalité |
|---|---|---|---|
| **Produit, sécurité & analytics** | 30 % | 1 500 000 | Migration backend sécurisée (bcrypt, JWT), audit sécurité, RGPD Sénégal, tests charge |
| **Capteurs IoT & hubs pilotes** | 25 % | 1 250 000 | 2 hubs froids équipés (sondes température, solaire), 20 crates connectées |
| **Opérations terrain & formation** | 20 % | 1 000 000 | 3 agents terrain, formation 50 agricultrices, matériel (téléphones, QR printer) |
| **Commercial B2B & finance** | 15 % | 750 000 | Onboarding 10 acheteurs ancres, 2 MoU SFD, kit commercial |
| **Mesure d'impact & conformité** | 10 % | 500 000 | Baseline études, audit externe (60 Decibels), rapport d'impact 1er trimestre |

**Livrables attendus à 6 mois post-financement** :
- 50+ producteurs actifs, 500+ transactions
- 1 hub froid pilote opérationnel, IoT fonctionnel
- 1 MoU signé avec une SFD, 5 dossiers bancabilité validés
- Premier rapport d'impact mesuré et publié

---

## Annexe A — Chiffres clés à retenir

- **300 Md FCFA** perdus chaque année au Sénégal en post-récolte
- **30-50 %** de pertes sur fruits et légumes frais (Banque mondiale)
- **45 %** d'adoption mobile money au Sénégal (GSMA 2023)
- **17 pays** couverts par le footprint Orange
- **70 %** de petits producteurs encore en 2G (→ USSD)
- **72 %** de femmes membres du GIE Femmes des Niayes
- **4 langues** locales supportées (fr, wolof, pulaar, sérère)
- **7,2 %** take rate moyen année 1

---

## Annexe B — Sources

1. FAO (2023) — *Post-harvest losses in Sub-Saharan Africa*
2. Banque mondiale (2024) — *Senegal Agribusiness Value Chain*
3. Banque mondiale (fév. 2026) — *AgriConnect Senegal Compact*
4. GSMA (2023) — *State of Mobile Money in West Africa*
5. Findex Database (2022) — *Account ownership at a financial institution*
6. ANSD (2022) — *Rapport annuel de l'agriculture sénégalaise*
7. Orange Sonatel (2024) — Communiqués POESAM, www.orange.com/fr/poesam
8. Sources internes FresCoop — *Technical whitepaper, IoT architecture*

---

*Document rédigé pour la candidature POESAM 2026 — Date limite de dépôt : 10 mai 2026.*
