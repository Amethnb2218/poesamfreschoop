const OFFLINE_RESPONSES = {
  arachide: `**Conseils pour la culture de l'arachide au Sénégal** 🥜

**Période de semis :** Dès les premières pluies utiles (mi-juin à mi-juillet selon votre zone)

**Préparation du sol :**
- Labour à 15-20 cm de profondeur
- Apport de phosphate (100 kg/ha de superphosphate simple)

**Variétés recommandées (ISRA) :**
- 55-437 (huilière, cycle 90 jours) — bassin arachidier
- 73-33 (bouche/confiserie, gros grains) — zone soudanienne
- Fleur 11 (huilière, résistante sécheresse) — zone sahélienne
- GC 8-35 (cycle 105 jours, bon rendement) — Casamance

**Densité de semis :** 50 cm entre lignes, 15 cm entre poquets

**Entretien :**
- 1er sarclage à 15 jours après levée
- 2ème sarclage + buttage à 30-35 jours
- Ne pas toucher les plantes après floraison (45 jours)

**Récolte :** Quand les feuilles jaunissent et que l'intérieur des coques est foncé (90-120 jours selon variété)`,

  tomate: `**Conseils pour la culture de la tomate au Sénégal** 🍅

**Meilleure période :** Saison sèche (novembre à mai) en culture irriguée

**Variétés adaptées (ISRA) :**
- Xina (résistante, bon rendement)
- Mongal F1 (marché frais, gros fruits)
- Tropimech (résistante chaleur, polyvalente)

**Pépinière :**
- Semis en pépinière pendant 3-4 semaines
- Repiquage quand les plants ont 4-5 feuilles

**Irrigation :**
- Goutte-à-goutte recommandé (économie d'eau de 40%)
- Arrosage régulier mais éviter l'excès (favorise les maladies)

**Problèmes courants :**
- **Pucerons :** Traitement au savon noir (50g/L) ou neem
- **Mildiou :** Bouillie bordelaise préventive
- **Nématodes :** Rotation avec céréales, solarisation du sol

**Espacement :** 80 cm entre lignes, 40 cm entre plants
**Rendement potentiel :** 20-40 tonnes/ha en irrigué`,

  mil: `**Conseils pour la culture du mil au Sénégal** 🌾

**Le mil (souna) est la céréale n°1 du Sénégal.**

**Période de semis :** Dès la 1ère pluie utile de 20mm (juin-juillet)

**Variétés ISRA recommandées :**
- Souna 3 (90 jours, zone sahélienne, rendement 1,5-2 t/ha)
- Thialack 2 (variété améliorée, bon rendement)
- IBV 8004 (75 jours, très précoce, zone sahélienne)

**Préparation :**
- Semis direct en poquets (5-7 graines/poquet)
- Espacement : 90 cm × 90 cm
- Démariage à 3 plants/poquet après 15 jours

**Fertilisation :**
- 150 kg/ha NPK (15-15-15) au semis
- 50 kg/ha urée au tallage (30 jours)

**Protection :**
- Contre les foreurs de tige : traitement précoce
- Contre les oiseaux (phase maturation) : gardiennage

**Rotation conseillée :** Mil → Arachide → Mil (restaure l'azote)
**Rendement moyen :** 800-1200 kg/ha (peut atteindre 2000 avec bonnes pratiques)`,

  irrigation: `**Guide d'irrigation pour la saison sèche au Sénégal** 💧

**Systèmes adaptés aux petits exploitants :**

1. **Goutte-à-goutte simplifié**
   - Kit de 500m² : ~150 000 FCFA
   - Économie d'eau : 40-60%
   - Idéal pour : tomate, oignon, piment

2. **Irrigation par bassins**
   - Coût faible
   - Adapté au riz de contre-saison
   - Zones : Fleuve Sénégal, Casamance

3. **Pompage solaire**
   - Investissement initial mais coût zéro en énergie
   - Programmes PAPSEN/PAIS pour subventions

**Besoins en eau des cultures (L/m²/jour) :**
- Tomate : 5-7 L
- Oignon : 4-6 L
- Chou : 4-5 L
- Piment : 3-5 L

**Conseils pratiques :**
- Arroser tôt le matin ou en fin d'après-midi
- Pailler autour des plants (réduit évaporation de 30%)
- Vérifier l'humidité du sol à 10cm avant d'arroser
- Eau de puits : vérifier la salinité en zone côtière`,

  oignon: `**Culture de l'oignon au Sénégal** 🧅

**Variété star :** Violet de Galmi
**Zones :** Niayes, Fleuve, Louga
**Période :** Pépinière en octobre, repiquage novembre-décembre
**Récolte :** Mars-Avril
**Rendement :** 20-30 t/ha

**Conseils :**
- Espacement 20×10 cm
- Irrigation régulière mais stop 2 semaines avant récolte
- Séchage 1 semaine au champ après arrachage
- Stockage en claies ventilées`,

  maladies: `**Lutte contre les ravageurs** 🐛

**Solutions naturelles (recommandées) :**
- **Neem (Nébédaye)** : Macération de feuilles (1kg/10L), efficace contre pucerons et chenilles
- **Savon noir** : 50g/L d'eau, contre pucerons et mouches blanches
- **Cendre de bois** : Saupoudrer, contre limaces et escargots
- **Piment + ail** : Macération, répulsif général

**Prévention :**
- Rotation des cultures (jamais 2x la même famille)
- Association cultures (tomate + basilic, maïs + niébé)
- Éliminer les résidus de culture infectés
- Favoriser les auxiliaires (coccinelles mangent les pucerons)`,

  marche: `**Consultez l'onglet "Tableau de bord"** pour voir les prix actuels du marché dans votre ville.

**Conseils de vente :**
- Stockez si les prix sont bas après récolte (offre élevée)
- Vendez en période de soudure (avril-juin) pour de meilleurs prix
- Les marchés hebdomadaires (loumas) offrent souvent de meilleurs prix
- Groupez-vous en coopérative pour négocier avec les bana-bana`,

  bonjour: `Bonjour ! Je suis votre conseiller agricole. Comment puis-je vous aider aujourd'hui ?

Vous pouvez me poser des questions sur vos cultures, la météo, les prix du marché ou un problème dans votre champ.`,

  riz: `**Culture du riz au Sénégal**

Le Sénégal produit 1.2 million tonnes de paddy (2024) mais importe encore 70% de sa consommation. L'autosuffisance en riz est une priorité nationale.

**Systèmes de production :**
- Irrigué (Vallée du Fleuve) : 2 récoltes/an, 5-8 t/ha avec Sahel 108 ou Sahel 202
- Pluvial (Casamance) : 1 récolte, 2-4 t/ha avec NERICA 4
- Bas-fonds (Kolda/Sédhiou) : 3-5 t/ha

**Variétés ISRA recommandées :**
- Sahel 108 (125 jours, irrigué, 6-8 t/ha)
- Sahel 202 (130 jours, irrigué, 7-9 t/ha)
- NERICA 4 (90 jours, pluvial Casamance)
- ISRIZ 12 (110 jours, irrigué)

**Fertilisation en irrigué :**
- 200 kg/ha DAP au repiquage
- 150 kg/ha urée au tallage (21 jours)
- 100 kg/ha urée à l'initiation paniculaire (50 jours)`,

  mais: `**Culture du maïs au Sénégal**

Production nationale : 450 000 tonnes (2024). Cultivé surtout en zone soudanienne et Casamance.

**Variétés ISRA :**
- Early Thai : 75 jours, toutes zones, 2-3 t/ha
- Synthetic C : 90 jours, zone soudanienne, 3-4 t/ha
- SWAN : 85 jours, soudanienne/Casamance, 3-4.5 t/ha

**Fertilisation :**
- 200 kg/ha NPK 15-15-15 au semis
- 100 kg/ha urée fractionnée (50kg à 30 jours, 50kg à 50 jours)

**Semis :** Écartement 80×25cm, 2 graines/poquet, dès que les pluies sont installées (cumul 30mm).`,

  niebe: `**Culture du niébé au Sénégal**

Excellente légumineuse qui fixe l'azote atmosphérique — parfaite en rotation après le mil ou l'arachide.

**Variétés ISRA :**
- Melakh : 60 jours, zone sahélienne, 1-1.5 t/ha
- Mouride : 65 jours, tolère bien la sécheresse, 1.2-1.8 t/ha
- Yacine : 70 jours, zone soudanienne, 1.5-2 t/ha

**Avantages :**
- Cycle très court (60-70 jours)
- Tolère la sécheresse
- Enrichit le sol en azote pour la culture suivante
- Bonne valeur marchande (600-800 FCFA/kg)

**Conseil :** Semer le niébé 2-3 semaines après le mil pour une bonne rotation sur la même parcelle.`,

  calendrier: `**Calendrier cultural — que faire et quand ?**

En mai-juin (maintenant) :
- Préparer les sols (labour 15-20cm)
- Acheter semences certifiées ISRA
- Retirer votre engrais subventionné
- Préparer le matériel (semoir, houe sine)

Dès les premières pluies utiles (20-30mm) :
- Zone sahélienne : semer mil et arachide hâtive
- Zone soudanienne : semer arachide, puis mil/maïs
- Casamance : riz pluvial et maïs

L'ANACIM prévoit un hivernage 2025 normal à excédentaire. Installation des pluies : fin juin au sud, mi-juillet au nord.`,

  engrais: `**Fertilisation — doses recommandées**

**Prix 2025 (subventionnés à 50%) :**
- NPK 15-15-15 : 18 000 FCFA/sac 50kg
- Urée 46% : 16 000 FCFA/sac 50kg
- DAP : 20 000 FCFA/sac 50kg

**Doses par culture :**
- Arachide : 150 kg/ha NPK 6-20-10 au semis
- Mil : 150 kg/ha NPK + 50 kg/ha urée à 30 jours
- Maïs : 200 kg/ha NPK + 100 kg/ha urée (fractionnée)
- Riz irrigué : 200 kg/ha DAP + 250 kg/ha urée (fractionnée)

**Conseil :** Toujours enfouir l'engrais à 5-10cm du poquet. Ne jamais mettre en contact direct avec la semence.`,

  sols: `**Les sols du Sénégal**

- **Dior** : Sablonneux (bassin arachidier). Pauvre en matière organique. Bien adapté à l'arachide et au mil. Améliorer avec fumier (5-10 t/ha).
- **Deck** : Argilo-sableux. Plus fertile et retient mieux l'eau. Bon pour maïs, sorgho.
- **Hollaldé** : Argileux lourd (vallée du fleuve). Excellent pour le riz irrigué.
- **Latéritique** : Ferrugineux (Casamance). Nécessite amendement organique.

**Améliorer son sol :**
- Apporter du fumier ou compost chaque année (5-10 t/ha)
- Faire une rotation avec des légumineuses (niébé, arachide)
- Ne pas brûler les résidus de récolte — les enfouir
- Faire analyser son sol tous les 3 ans (ISRA, 5 000 FCFA)`,

  financement: `**Financement agricole au Sénégal**

**La Banque Agricole (ex-CNCAS) :**
- Crédit de campagne : taux 7.5%
- Crédit équipement : jusqu'à 5 ans
- Accessible via GIE ou coopérative

**DER (Délégation à l'Entrepreneuriat Rapide) :**
- Financement pour jeunes et femmes
- Agriculture, élevage, transformation
- Montant : 500 000 à 5 000 000 FCFA

**Subventions engrais :**
- L'État subventionne à 50% via points de vente agréés
- Nécessite carte d'agriculteur (délivrée par le sous-préfet)

**FONGIP :**
- Fonds de garantie pour les prêts agricoles
- Facilite l'accès au crédit bancaire`,

  climat: `**Climat et adaptation au Sénégal**

**Tendances observées :**
- La saison des pluies a reculé de 2-3 semaines par rapport aux années 80
- Les événements extrêmes (fortes pluies, sécheresses) sont plus fréquents
- Températures en hausse de +1.5°C en 40 ans

**Stratégies d'adaptation :**
- Utiliser des variétés à cycle court (75-90 jours) adaptées à un hivernage plus court
- Semis échelonné : ne pas tout semer le même jour, étaler sur 2-3 semaines
- Zaï et demi-lunes : capter l'eau en zone sahélienne sèche
- Agroforesterie : Faidherbia albida dans les champs (ombre, azote, ne perd pas ses feuilles en hivernage)
- RNA (Régénération Naturelle Assistée) : protéger les repousses d'arbres`,

  saison: `**Que faire maintenant ? (Mai 2025)**

Nous sommes en période de pré-hivernage. Voici les actions prioritaires :

1. **Acheter vos semences** certifiées ISRA maintenant (elles seront en rupture en juin)
2. **Labourer vos parcelles** — labour profond 15-20cm avant les pluies
3. **Retirer votre engrais** subventionné au point de vente agréé
4. **Planifier votre rotation** — ne pas remettre la même culture 2 ans de suite
5. **Préparer le compost** — les résidus de récolte dans la fosse fumière
6. **Vérifier le matériel** — semoir, houe sine, pulvérisateur

L'ANACIM prévoit un hivernage 2025 normal à excédentaire. Premières pluies utiles attendues fin juin au sud, mi-juillet au nord.`,

  default: `Je peux vous aider sur tout ce qui concerne l'agriculture au Sénégal : cultures, semis, engrais, maladies, sols, météo, prix, financement...

Posez-moi une question précise, par exemple :
- "Quand semer l'arachide à Kaolack ?"
- "Quelle variété de riz pour la Casamance ?"
- "Comment traiter les pucerons sur tomate ?"
- "Quel engrais pour le mil ?"
- "Comment obtenir un crédit agricole ?"`
};

export { OFFLINE_RESPONSES };
