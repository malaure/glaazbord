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
│   │       ├── Badge.tsx       — BadgeStatut + BadgeType
│   │       ├── Toggle.tsx      — toggle paiement avec date
│   │       └── Autocomplete.tsx
│   ├── pages/
│   │   ├── Affaires.tsx        — page principale (tableau + KPI)
│   │   ├── Clients.tsx         — CRUD clients
│   │   ├── Fournisseurs.tsx    — CRUD fournisseurs
│   │   └── ExportURSSAF.tsx    — export déclaration mensuel/trimestriel
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
DEVIS → FACTURÉ → PAYÉ
                ↘ ANNULÉ (exclu de toutes les stats)
```

- Statut calculé automatiquement dans le formulaire :
  - Ajout `refFacture` → passe à `FACTURÉ`
  - Toggle "Client payé" → passe à `PAYÉ` + enregistre `datePaiementClient`
- Lignes en retard : `dateEcheance` dépassée + statut pas `PAYÉ` → fond pêche/corail dans le tableau

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
- `lavender` : violet doux — CTA, badges FACTURÉ, sélection active
- `mint` : vert doux — badges PAYÉ, net en poche, positif
- `peach` : corail doux — retards, alertes
- `powder` : bleu poudré — badges DEVIS, dégradé CTA

**Typographie** : Inter, tailles `2xs` (11px) / `xs` (12px) / `sm` (13px) / `base` (14px)

**Layout** : sidebar nav 220px | zone centrale flexible | KPI sidebar 280px | topbar 56px sticky

**Éviter absolument** : glassmorphism, dark mode, gradients de fond, shadows lourdes, couleurs saturées, style bootstrap

---

## Base de données — schéma D1

3 tables : `affaires`, `clients`, `fournisseurs`

Points importants :
- `affaires.statut` : `'DEVIS' | 'FACTURE' | 'PAYE' | 'ANNULE'` (sans accent dans la DB)
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
- Import CSV des 60 affaires existantes pour remplir la base initiale
- Raccourci clavier pour "Nouvelle affaire"
- Export données brutes JSON/CSV pour sauvegarde manuelle
