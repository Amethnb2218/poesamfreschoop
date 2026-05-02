# 📁 Dossier candidature POESAM 2026 — FresCoop

## ⏰ Rappel
**Date limite de dépôt** : 10 mai 2026 (à 23h59 heure de Dakar)
**Nombre de jours restants** : ~11 jours (comptés depuis le 29 avril)

---

## 📑 Livrables contenus dans ce dossier

| Fichier | Usage | Format final à produire |
|---|---|---|
| `00-README.md` | Guide d'utilisation | Navigation interne |
| `01-DOSSIER-COMPLET.md` | Dossier détaillé 10 sections | **→ PDF** (15-20 pages) |
| `02-PRESENTATION-PPT.md` | Structure 13 slides + direction artistique | **→ PPTX** |
| `03-PITCHS-ORAUX.md` | 3 versions de pitchs (1/3/5 min) | **→ À répéter à voix haute** |
| `04-RESUME-EXECUTIF.md` | 1 page synthèse | **→ PDF 1 page** |

---

## 🚀 Plan d'action 11 jours

### Phase 1 — Personnalisation (J1-J2)
- [ ] Remplir les placeholders `[NOM Prénom]` dans TOUS les fichiers
- [ ] Ajouter votre biographie et motivation personnelle (section 6 du dossier complet)
- [ ] Adapter les chiffres équipe selon la vraie composition
- [ ] Vérifier cohérence des montants financement (5 M FCFA ou autre)

### Phase 2 — Conversion en livrables finaux (J3-J4)
- [ ] **Dossier PDF** : convertir `01-DOSSIER-COMPLET.md` via [MarkdownToPDF](https://md2pdf.netlify.app/) ou Pandoc
  ```bash
  pandoc 01-DOSSIER-COMPLET.md -o FresCoop-Dossier-POESAM-2026.pdf --pdf-engine=xelatex -V geometry:margin=2cm -V mainfont="Arial"
  ```
- [ ] **PPTX** : créer sur Canva Pro ou PowerPoint en suivant `02-PRESENTATION-PPT.md`
- [ ] **Résumé 1 page** : convertir `04-RESUME-EXECUTIF.md` en PDF (Google Docs → Export PDF)

### Phase 3 — Terrain & partenariats (J3-J5)
- [ ] Envoyer emails aux 3 coopératives ciblées
- [ ] Contacter 2 SFD (Cofina, PAMECAS)
- [ ] Rencontrer physiquement 5 agricultrices pour tests
- [ ] Filmer 1 témoignage de 30 secondes

### Phase 4 — Vidéo démo (J6-J7)
- [ ] Enregistrer écran avec OBS Studio (parcours démo 2 min)
- [ ] Générer voix off sur ElevenLabs (gratuit 10 min)
- [ ] Montage sur Canva Pro ou DaVinci Resolve
- [ ] Export MP4 1080p < 100 Mo

### Phase 5 — Relecture & dépôt (J8-J10)
- [ ] 2 relecteurs externes (orthographe, clarté)
- [ ] Test d'upload sur la plateforme POESAM
- [ ] **Dépôt au plus tard le 8 mai à 18h** (48h de marge de sécurité)

---

## ⚠️ Checklist avant dépôt

### Documents obligatoires
- [ ] Formulaire de candidature POESAM rempli (sur le site Orange)
- [ ] CV du porteur (1-2 pages max)
- [ ] Pièce d'identité scannée
- [ ] Dossier projet PDF (15-20 pages)
- [ ] Pitch deck PPTX ou PDF (13 slides)
- [ ] Résumé exécutif 1 page PDF

### Documents recommandés (bonus)
- [ ] Vidéo démo 1-2 min
- [ ] Lettre(s) de soutien partenaire(s)
- [ ] Photos terrain (agriculteurs utilisant FresCoop)
- [ ] Captures d'écran UI de haute qualité
- [ ] Business plan détaillé (Excel 3 ans)

### Vérifications finales
- [ ] Tous les fichiers PDF < 10 Mo
- [ ] Vidéo MP4 < 100 Mo (ou lien YouTube non-listé)
- [ ] Aucune faute d'orthographe majeure
- [ ] Nom fichier clair : `FresCoop_Dossier_POESAM2026.pdf`
- [ ] Backup cloud de tous les fichiers (Google Drive + Dropbox)

---

## 🎯 Stratégie de candidature

### Axe principal à défendre
**« FresCoop est une infrastructure numérique de confiance agricole, déjà livrable, qui transforme 300 milliards FCFA de pertes annuelles en revenus mesurables. »**

### 3 arguments massue à marteler
1. **Prêt à déployer** (vs. maquettes des concurrents)
2. **Aligné avec le cadrage 2026** (IA, data, inclusion financière)
3. **Scalable 17 pays** via le footprint Orange

### Ce qu'il faut ÉVITER dans le discours
- Jargon technique excessif
- Projections sans fondement
- Comparaisons négatives avec les concurrents
- Promesses qu'on ne peut pas tenir en 6 mois

---

## 📧 Contacts utiles

- **POESAM candidature** : engage-for-change.orange.com
- **Sonatel Dakar** : coordonnées sur sonatel.sn
- **PayDunya support** : support@paydunya.com
- **ISRA** : isra.sn
- **Cofina Sénégal** : cofinasenegal.com
- **PAMECAS** : pamecas.sn

---

*Bonne chance pour le concours. Tu as déjà 70 % du dossier. Les 30 % restants sont du terrain et de la rédaction. Vas-y !*
