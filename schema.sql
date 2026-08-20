-- GlaazBoard — schéma D1 (SQLite)

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  societe TEXT NOT NULL,
  interlocuteurs TEXT NOT NULL DEFAULT '[]', -- JSON array
  delai_paiement_jours INTEGER NOT NULL DEFAULT 30,
  adresse TEXT, -- adresse postale de livraison (étiquettes)
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fournisseurs (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS affaires (
  id TEXT PRIMARY KEY,
  ref_devis TEXT NOT NULL,
  ref_facture TEXT,
  date_devis TEXT,
  date_facture TEXT,
  statut TEXT NOT NULL DEFAULT 'DEVIS', -- déprécié, plus utilisé par l'app (voir statut_prod) — conservé pour rollback
  societe TEXT NOT NULL,
  interlocuteur TEXT,
  designation TEXT NOT NULL,
  notes TEXT,
  type TEXT NOT NULL DEFAULT 'SERVICE', -- BIEN | SERVICE | MIXTE
  prix_vente_ht REAL,
  montant_bien_ht REAL,
  montant_service_ht REAL,
  cout_achat_ttc REAL,
  fournisseur TEXT,
  notes_fournisseur TEXT,
  delai_paiement_jours INTEGER,
  date_echeance TEXT,
  fournisseur_paye INTEGER NOT NULL DEFAULT 0,
  date_paiement_fournisseur TEXT,
  client_paye INTEGER NOT NULL DEFAULT 0,
  date_paiement_client TEXT,
  affaire_parent_id TEXT,
  statut_prod TEXT, -- COMMANDE_RECUE | CREATION_A_FAIRE | ATTENTE_BAT | EN_IMPRESSION | EN_LIVRAISON | ATTENTE_FACTURATION | PROD_FACTURE | PAYE | ANNULE (statut unique de l'affaire)
  ref_commande_client TEXT, -- référence commande donnée par le client (ex : n° EPO chez PPG), pour étiquettes et suivi
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (affaire_parent_id) REFERENCES affaires(id)
);

CREATE INDEX IF NOT EXISTS idx_affaires_statut_prod ON affaires(statut_prod);
CREATE INDEX IF NOT EXISTS idx_affaires_societe ON affaires(societe);
CREATE INDEX IF NOT EXISTS idx_affaires_date_paiement ON affaires(date_paiement_client);
