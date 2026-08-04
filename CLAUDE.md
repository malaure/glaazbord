# GlaazBoard — CLAUDE.md

Application web de suivi de rentabilité pour **GLAAZ**, auto-entreprise de Luis De Carvalho, gérée par Marie (graphiste/PAO). Utilisatrice unique : Marie.

---

## Contexte métier

- **Structure** : auto-entrepreneur BNC, franchise de TVA
- **Objectif** : remplacer un fichier Excel de suivi de rentabilité par affaire
- **Règle** : Marie ne crée une affaire que si elle a un bon de commande (pas de devis sans suite)
- **Outil de facturation** : Indy (GlaazBoard ne génère pas les devis/factures, ne se connecte pas à Indy)
- **Déclaration URSSAF** : mensuelle sur autoentrepreneur.urssaf.fr — basée sur les **encaissements réels** (date paiement client), jamais sur la date de facture

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styles | Tailwind CSS 3 (config custom) |
| Routing | React Router v6 |
| Backend | Cloudflare Pages Functions (Workers) |
| Base de données | Cloudflare D1 (SQLite managé) |
| PDF parsing | pdfjs-dist (côté navigateur) |
| Icônes | lucide-react |

**Pas d'authentification** — usage solo, pas de cloud tiers, pas de sync.

---

## Déploiement

- **URL de prod** : https://2191175a.glaazboard.pages.dev
- **Cloudflare Pages** : projet `glaazboard`, branche `production`
- **D1 database** : `glaazboard-db` — ID `b6168613-0aac-4459-80f6-04c9e586e0bc` — région WEUR

### Déployer une mise à jour
```bash
npm run build
npx wrangler pages deploy dist
```

### Dev local
```bash
# Première fois seulement — initialiser la base locale
npx wrangler d1 execute glaazboard-db --local --file=schema.sql

# Lancer
npm run build
npx wrangler pages dev dist --d1=DB --port=4321
```
→ Ouvrir http://localhost:4321

---

## Structure des fichiers

```
glaaz-gestion/
├── src/
│   ├── types/index.ts          — types TypeScript (Affaire, Client, Fournisseur, CalcResult)
│   ├── utils/calculs.ts        — moteur de calcul BIEN/SERVICE/MIXTE + formatage
│   ├── store/useStore.ts       — hooks React (useAffaires, useClients, useFournisseurs)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     — navigation gauche 220px
│   │   │   ├── TopBar.tsx      — barre du haut + bouton "Nouvelle affaire"
│   │   │   └── KPISidebar.tsx  — sidebar droite KPI permanents
│   │   ├── affaires/
│   │   │   ├── AffaireTable.tsx — tableau principal avec filtres et tri
│   │   │   └── AffaireForm.tsx  — modal création/édition + import PDF
│   │   ├── dashboard/
│   │   │   └── ResumeMois.tsx  — popup résumé mensuel
│   │   └── ui/
│   │       ├── Badge.tsx       — BadgeStatut + BadgeType + BadgeStatutProd
│   │       ├── Toggle.tsx      — toggle paiement avec date
│   │       └── Autocomplete.tsx
│   ├── pages/
│   │   ├── Affaires.tsx        — page principale (tableau + KPI)
│   │   ├── Clients.tsx         — CRUD clients
│   │   ├── Fournisseurs.tsx    — CRUD fournisseurs
│   │   ├── ExportURSSAF.tsx    — export déclaration mensuel/trimestriel
│   │   └── CalculateurLaser.tsx — calculateur devis (onglets Laser + PAO/Print)
│   ├── App.tsx                 — router + layout global
│   └── main.tsx
├── functions/api/              — Cloudflare Pages Functions (API REST)
│   ├── affaires.ts             — GET /api/affaires, POST /api/affaires
│   ├── affaires/[id].ts        — PUT, DELETE /api/affaires/:id
│   ├── clients.ts
│   ├── clients/[id].ts
│   ├── fournisseurs.ts
│   └── fournisseurs/[id].ts
├── schema.sql                  — schéma D1 (tables + index)
├── wrangler.toml               — config Cloudflare (binding D1)
├── tailwind.config.js          — couleurs custom GLAAZ
└── vite.config.ts
```

---

## Fonctionnalités implémentées

### Tableau des affaires (`AffaireTable.tsx`)
- **Tri** : toutes les colonnes sont cliquables (clic = asc, reclic = desc) — y compris les colonnes calculées (marge, charges, net)
- **Recherche globale** : input loupe en haut à gauche, filtre en temps réel dans toutes les colonnes (société, désignation, réfs, interlocuteur, fournisseur, montants, notes, EPO…)
- **Filtre statut** : menu déroulant "Tous statuts" (les 9 valeurs de `statutProd`, voir plus bas) — pas de boutons rapides séparés
- **Filtre société** : select déroulant
- **Filtre mois** : input type=month — filtre sur dateDevis OU dateFacture OU datePaiementClient (montre toutes les affaires du mois quel que soit le statut)
- **Bande totaux** (lavande) : s'affiche dès qu'un filtre statut ou société est actif — affiche CA HT, Marge, Net en poche du sous-ensemble filtré (hors annulés, hors parents)
- **Colonnes redimensionnables** : poignée de resize sur chaque en-tête, largeurs persistées en localStorage
- **Édition inline** : clic direct sur une cellule pour modifier sans ouvrir le formulaire
  - Selects : Statut (les 9 valeurs de `statutProd`) — sauvegarde immédiate au changement
  - Inputs texte : Réf devis, Réf facture, Désignation, Fournisseur, Notes — `Enter` ou perte de focus pour valider, `Escape` pour annuler
  - Inputs date : Date devis, Date facture, Échéance — sauvegarde au choix de la date
  - Passage à PAYÉ via le select statut → coche automatiquement `clientPaye` avec la date du jour ; en sortir repasse `clientPaye` à false
  - Cellules éditables signalées par `hover:bg-lavender-50` ; cellules non-éditables (société, interlocuteur, montants, type) → clic sur la ligne ouvre le formulaire complet
  - Handler `onPatchAffaire(id, patch)` dans `Affaires.tsx` → appelle `modifier(id, patch)`

### KPI Sidebar droite (`KPISidebar.tsx`)
- **Année en cours** : CA HT, achats, marge, charges, net
- **Mois courant et M-1** : CA biens/services, charges, net — basés sur `datePaiementClient`
- **Sur mon compte** : calcul temps réel du solde estimé = encaissé clients − URSSAF calculée sur ces encaissements − achats fournisseurs payés
- **Trésorerie & En-cours** : encaissé / à encaisser (facturé) / en attente (devis) / fournisseurs

### Authentification (`functions/_middleware.ts`)
- Cookie `gb_auth` HMAC-SHA256 — 90 jours, HttpOnly, Secure, SameSite=Strict
- Route `/__login` (POST) avec délai anti-brute-force 200ms
- Route `/__logout` : supprime le cookie et redirige vers login
- Bouton déconnexion (icône LogOut) dans la TopBar, à droite du bouton "Nouvelle affaire"
- Dev local sans variable `AUTH_PASSWORD` = pas de protection (bypass automatique)

### Résumé du mois (`ResumeMois.tsx`)
- Popup accessible via le bouton en haut du tableau
- Affiche **3 sections** : Encaissé (`clientPaye`, base URSSAF) + Facturé (`refFacture` renseigné et pas encore payé, `dateFacture` dans le mois) + Devis (pas de `refFacture`, `dateDevis` dans le mois)
- Vue d'ensemble en 3 tuiles avec CA et nb d'affaires par statut
- Section charges/net en poche uniquement sur la partie encaissée (déclaration URSSAF)
- Liste détaillée des affaires pour chaque section

### Export URSSAF (`ExportURSSAF.tsx`)
- Sélecteur mensuel ou trimestriel
- Flèches ‹ › pour naviguer de mois en mois sans toucher l'input
- Tableau des affaires encaissées sur la période + récapitulatif biens/services/charges/net

### Calculateur devis (`CalculateurLaser.tsx`) — route `/laser`

Deux onglets, paramètres persistés en `localStorage` :

> **Net matière** = (PV HT − coût d'achat TTC) − charges, comme dans `calculs.ts` (BIEN). Le coût d'achat est bien déduit, pas seulement les charges — affiché en ligne `Coût matière TTC − X €` dans le détail.

**Onglet Laser (xTool P2S 55W)**
- Ligne matière : achat TTC × coefficient fixe 2.306 → PV HT, charges 13,3%, net (achat déduit)
  - Deux modes (sélecteur dans la carte) : **Achat direct** (saisie du coût TTC) ou **Depuis une plaque** : prix plaque TTC + dimensions plaque et pièce (en **mm**) + nb pièces + marge de coupe → coût matière au prorata `prix × (surface pièces / surface plaque)`. Marge de coupe (défaut 5 mm/bord, modifiable) ajoutée tout autour de chaque pièce. Prix + dimensions plaque + marge persistés en localStorage.
- Ligne service : durée gravure + prépa (minutes) × (coût machine + taux horaire) → PV HT, charges 27,8%, net
- Coût machine ~2.648 €/h = amortissement (4570 € / 4 ans / 600 h/an) + électricité (920W × 65% × 0.2516 €/kWh) + filtres AP2 + optiques P2S
- Source des constantes : `GLAAZ_Calculateur_Gravure_Laser.xlsx`

**Onglet PAO / Print**
- Ligne matière : achat TTC × quantité × coefficient variable (défaut 2.13, modifiable), charges 13,3%, net (achat déduit)
- Ligne création graphique BNC : taux net souhaité (€/h) → taux facturé = net / (1 − 27,8%), × heures
- Source du modèle : `grille_tarifs_glaaz.xlsx`

**Mode privé (bouton œil)**
- Masque : charges URSSAF, net encaissé, taux net %, coefficient multiplicateur dans les labels
- Affiche uniquement : prix de vente HT par ligne + total devis HT
- Bouton vire en peach quand actif pour signaler le mode

### Statut (`statutProd`)
- Colonne unique de statut sur `Affaire` (obligatoire) : `COMMANDE_RECUE | CREATION_A_FAIRE | ATTENTE_BAT | EN_IMPRESSION | EN_LIVRAISON | ATTENTE_FACTURATION | PROD_FACTURE | PAYE | ANNULE`
- Fusionne l'ancien couple `statut` (DEVIS/FACTURE/PAYE/ANNULE, cycle de facturation) + `statutProd` (avancement production) — les deux avaient divergé en usage réel (Marie n'ajoute une affaire qu'avec commande reçue, donc "DEVIS" ne voulait plus rien dire) et pouvaient se désynchroniser
- Select dans `AffaireForm`, colonne triable "Statut" dans `AffaireTable` (édition inline), badge coloré `BadgeStatutProd` dans `Badge.tsx`
- Passer à `PAYE` coche automatiquement `clientPaye` + `datePaiementClient` (aujourd'hui si vide) ; en sortir repasse `clientPaye` à false et `statutProd` à `PROD_FACTURE` (si `refFacture` renseigné) ou `COMMANDE_RECUE`
- "Facturé mais pas encore payé" et "pas encore facturé" ne sont plus des valeurs de l'enum : ils se déduisent de la présence de `refFacture` + `clientPaye` (voir `KPISidebar.tsx`, `ResumeMois.tsx`)
- Colonne `statut_prod TEXT` dans D1. L'ancienne colonne `statut` reste en base (gelée, plus lue ni écrite par l'app) pour rester réversible sans risque

### Anti double-comptage acomptes (`calculs.ts`)
- `sansParents(affaires)` : exclut les affaires-conteneurs dont l'ID est référencé comme `affaireParentId` par un enfant — évite de compter 2× les affaires avec acomptes (ex : BUULD 900€ parent + 450€+450€ enfants)
- Appliqué dans KPISidebar, AffaireTable (totaux filtrés) — pas nécessaire dans ExportURSSAF car les parents n'ont pas de `datePaiementClient`

---

## Règles de calcul URSSAF (fichier `src/utils/calculs.ts`)

| Type | Taux charges | Formule marge | Formule net |
|---|---|---|---|
| **BIEN** | 13,3% (URSSAF 12,3% + IR 1%) | PV HT - Coût achat TTC | Marge - Charges |
| **SERVICE** | 27,8% (URSSAF 25,6% + IR 2,2%) | PV HT | PV HT - Charges |
| **MIXTE** | 13,3% sur part Bien + 27,8% sur part Service | (Bien HT - Coût achat) + Service HT | Marge - Charges totales |

**Important** : les statistiques et l'export URSSAF utilisent toujours `datePaiementClient` (encaissement réel), jamais `dateFacture`.

---

## Cycle de vie d'une affaire

```
COMMANDE_RECUE → CREATION_A_FAIRE → ATTENTE_BAT → EN_IMPRESSION → EN_LIVRAISON → ATTENTE_FACTURATION → PROD_FACTURE → PAYÉ
                                                                                                                    ↘ ANNULÉ (exclu de toutes les stats, à tout moment)
```

- `statutProd` est piloté manuellement par Marie (aucune auto-transition liée à la saisie de `refFacture`)
- Toggle "Client payé" (dans le tableau ou le formulaire) → passe `statutProd` à `PAYÉ` + enregistre `datePaiementClient` ; décocher repasse `statutProd` à `PROD_FACTURE` (si facturé) ou `COMMANDE_RECUE`
- Lignes en retard : `dateEcheance` dépassée + pas encore payée + `dateFacture` renseignée → fond pêche/corail dans le tableau (`estEnRetard` dans `calculs.ts`)

---

## Acomptes

Les versements échelonnés sont des lignes distinctes liées via `affaireParentId`. Dans le tableau, les lignes enfants sont indentées (↳) et affichent `border-l-2 border-l-lavender-200`. Chaque ligne a sa propre date de paiement pour la déclaration URSSAF.

---

## Design system (Tailwind custom)

**Palette** (définie dans `tailwind.config.js`) :
- `surface` : #F8F8FB — fonds secondaires, sidebar droite
- `border` : #EBEBF0 — toutes les bordures
- `text-main` : #1A1A2E — texte principal
- `text-muted` : #8888A0 — labels, secondaire
- `lavender` : violet doux — CTA, sélection active
- `mint` : vert doux — badge Payé, net en poche, positif
- `peach` : corail doux — retards, alertes
- `powder` : bleu poudré — dégradé CTA

**Typographie** : Inter, tailles `2xs` (11px) / `xs` (12px) / `sm` (13px) / `base` (14px)

**Layout** : sidebar nav 220px | zone centrale flexible | KPI sidebar 280px | topbar 56px sticky

**Éviter absolument** : glassmorphism, dark mode, gradients de fond, shadows lourdes, couleurs saturées, style bootstrap

---

## Base de données — schéma D1

3 tables : `affaires`, `clients`, `fournisseurs`

Points importants :
- `affaires.statut_prod` : `'COMMANDE_RECUE' | 'CREATION_A_FAIRE' | 'ATTENTE_BAT' | 'EN_IMPRESSION' | 'EN_LIVRAISON' | 'ATTENTE_FACTURATION' | 'PROD_FACTURE' | 'PAYE' | 'ANNULE'` — statut unique de l'affaire (voir section "Statut" plus haut)
- `affaires.statut` : colonne historique, dépréciée, plus lue ni écrite par l'app (conservée pour rollback)
- `affaires.type` : `'BIEN' | 'SERVICE' | 'MIXTE'`
- `clients.interlocuteurs` : JSON array stocké en TEXT
- Booleans stockés en INTEGER (0/1) dans SQLite

---

## Ce que l'appli ne fait PAS

- Ne génère pas les devis/factures (ça reste dans Indy)
- Ne se connecte pas à Indy
- Ne gère pas la TVA (franchise de base)
- Pas de comptabilité officielle
- Pas d'authentification
- Pas de dark mode

---

## Fonctionnalités à venir / pistes

- Page Statistiques (graphiques annuels, évolution CA, top clients) — squelette présent dans `App.tsx`
- Raccourci clavier pour "Nouvelle affaire"
- Export données brutes JSON/CSV pour sauvegarde manuelle
- af39, af40, af41 (commandes PPG 04/06/2026) ont `ref_devis = 'À compléter'` — à mettre à jour avec les vrais numéros Indy
- Calculateur : possibilité d'ajouter plusieurs lignes matière / service dans un même devis
