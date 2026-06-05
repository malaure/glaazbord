-- ============================================================
-- Rapprochement factures Indy → affaires GlaazBoard
-- ============================================================
-- Numéros de facture Indy = séquentiels, indépendants des devis.
-- Rapprochement fait par montant TTC + client + interlocuteur.
--
-- ATTENTION : dates_paiement_client pour PPG = date_facture + 45j (estimation).
-- Vérifier les dates exactes dans Indy avant toute déclaration URSSAF.
--
-- 8 devis sans facture (statut DEVIS inchangé) :
--   af01 D 202606-1  PPG/Romain Gravelle       269,90€
--   af02 D 202605-10 PPG/Sabrina Vansuyt        260,12€
--   af03 D 202605-11 PPG/Noémie Delvaux         223,10€
--   af04 D 202605-9  PPG/Sabrina Vansuyt        145,59€
--   af05 D 202605-4  PPG/Jeremy Tourolle        945,56€
--   af13 D 202604-4  Mairie de Marly            636,00€
--   af21 D 202603-9  NORVEL/Romain Mottet     1 490,00€
--   af34 D 202602-2  PPG/Mathieu Brisy        1 025,00€
-- ============================================================

-- ── FACTURES PAYÉES (24) ────────────────────────────────────

-- F 202601-1 | 22/01/2026 | GALEA Immobilier | Calendrier / Carte de voeux | 598,46€
UPDATE affaires SET
  ref_facture = '202601-1', date_facture = '2026-01-22', date_echeance = '2026-01-22',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-01-22',
  updated_at = datetime('now')
WHERE id = 'af38';

-- F 202602-1 | 05/02/2026 | GALEA Immobilier | Panneau Loué par l'agence | 249,04€
UPDATE affaires SET
  ref_facture = '202602-1', date_facture = '2026-02-05', date_echeance = '2026-02-05',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-02-05',
  updated_at = datetime('now')
WHERE id = 'af37';

-- F 202602-2 | 13/02/2026 | PPG / Jeremy TOUROLLE | 300,80€ — paiement estimé +45j = 30/03/2026
UPDATE affaires SET
  ref_facture = '202602-2', date_facture = '2026-02-13', date_echeance = '2026-03-30',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-03-30',
  updated_at = datetime('now')
WHERE id = 'af36';

-- F 202602-3 | 23/02/2026 | PPG / Stéphane FRANÇAIS | 152,76€ — paiement estimé +45j = 09/04/2026
UPDATE affaires SET
  ref_facture = '202602-3', date_facture = '2026-02-23', date_echeance = '2026-04-09',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-04-09',
  updated_at = datetime('now')
WHERE id = 'af35';

-- F 202602-4 | 23/02/2026 | PPG / FRANCOIS Stéphane | 380,52€ — paiement estimé +45j = 09/04/2026
UPDATE affaires SET
  ref_facture = '202602-4', date_facture = '2026-02-23', date_echeance = '2026-04-09',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-04-09',
  updated_at = datetime('now')
WHERE id = 'af33';

-- F 202603-1 | 12/03/2026 | PPG / Sabrina Vansuyt | 245,00€ — paiement estimé +45j = 26/04/2026
UPDATE affaires SET
  ref_facture = '202603-1', date_facture = '2026-03-12', date_echeance = '2026-04-26',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-04-26',
  updated_at = datetime('now')
WHERE id = 'af32';

-- F 202603-2 | 12/03/2026 | PPG / FRANCOIS Stéphane | 593,97€ — paiement estimé +45j = 26/04/2026
UPDATE affaires SET
  ref_facture = '202603-2', date_facture = '2026-03-12', date_echeance = '2026-04-26',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-04-26',
  updated_at = datetime('now')
WHERE id = 'af28';

-- F 202603-3 | 12/03/2026 | PPG / Sabrina Vansuyt | 168,70€ — paiement estimé +45j = 26/04/2026
UPDATE affaires SET
  ref_facture = '202603-3', date_facture = '2026-03-12', date_echeance = '2026-04-26',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-04-26',
  updated_at = datetime('now')
WHERE id = 'af31';

-- F 202603-4 | 13/03/2026 | Grand Prix de Denain | 200,00€
UPDATE affaires SET
  ref_facture = '202603-4', date_facture = '2026-03-13', date_echeance = '2026-03-13',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-03-13',
  updated_at = datetime('now')
WHERE id = 'af30';

-- F 202603-5 | 25/03/2026 | PPG / Jeremy Tourolle | 457,00€ — paiement estimé +45j = 09/05/2026
UPDATE affaires SET
  ref_facture = '202603-5', date_facture = '2026-03-25', date_echeance = '2026-05-09',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-09',
  updated_at = datetime('now')
WHERE id = 'af26';

-- F 202603-6 | 25/03/2026 | PPG / Jeremy TOUROLLE | 55,26€ — paiement estimé +45j = 09/05/2026
UPDATE affaires SET
  ref_facture = '202603-6', date_facture = '2026-03-25', date_echeance = '2026-05-09',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-09',
  updated_at = datetime('now')
WHERE id = 'af25';

-- F 202603-7 | 25/03/2026 | PPG / Sabrina Vansuyt | 1 297,40€ — paiement estimé +45j = 09/05/2026
UPDATE affaires SET
  ref_facture = '202603-7', date_facture = '2026-03-25', date_echeance = '2026-05-09',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-09',
  updated_at = datetime('now')
WHERE id = 'af24';

-- F 202603-8 | 25/03/2026 | PPG / Sabrina Vansuyt | 177,86€ — paiement estimé +45j = 09/05/2026
UPDATE affaires SET
  ref_facture = '202603-8', date_facture = '2026-03-25', date_echeance = '2026-05-09',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-09',
  updated_at = datetime('now')
WHERE id = 'af22';

-- F 202603-10 | 27/03/2026 | DCX Chrome | 35,00€
UPDATE affaires SET
  ref_facture = '202603-10', date_facture = '2026-03-27', date_echeance = '2026-03-27',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-03-27',
  updated_at = datetime('now')
WHERE id = 'af29';

-- F 202603-11 | 30/03/2026 | PPG / Valérie COULIER | 791,00€ — paiement estimé +45j = 14/05/2026
UPDATE affaires SET
  ref_facture = '202603-11', date_facture = '2026-03-30', date_echeance = '2026-05-14',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-14',
  updated_at = datetime('now')
WHERE id = 'af20';

-- F 202604-1 | 01/04/2026 | PPG / Sabrina Vansuyt | 38,40€ — paiement estimé +45j = 16/05/2026
UPDATE affaires SET
  ref_facture = '202604-1', date_facture = '2026-04-01', date_echeance = '2026-05-16',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-16',
  updated_at = datetime('now')
WHERE id = 'af17';

-- F 202604-2 | 13/04/2026 | PPG / Sabrina Vansuyt | 90,35€ — paiement estimé +45j = 28/05/2026
UPDATE affaires SET
  ref_facture = '202604-2', date_facture = '2026-04-13', date_echeance = '2026-05-28',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-28',
  updated_at = datetime('now')
WHERE id = 'af16';

-- F 202604-3 | 13/04/2026 | PPG / FRANCOIS Stéphane | 73,20€ — paiement estimé +45j = 28/05/2026
UPDATE affaires SET
  ref_facture = '202604-3', date_facture = '2026-04-13', date_echeance = '2026-05-28',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-28',
  updated_at = datetime('now')
WHERE id = 'af15';

-- F 202604-4 | 13/04/2026 | PPG / Sabrina Vansuyt | 19,20€ — paiement estimé +45j = 28/05/2026
UPDATE affaires SET
  ref_facture = '202604-4', date_facture = '2026-04-13', date_echeance = '2026-05-28',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-28',
  updated_at = datetime('now')
WHERE id = 'af14';

-- F 202604-5 | 16/04/2026 | PPG / Jérémy Tourolle | 175,00€ — paiement estimé +45j = 31/05/2026
UPDATE affaires SET
  ref_facture = '202604-5', date_facture = '2026-04-16', date_echeance = '2026-05-31',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-31',
  updated_at = datetime('now')
WHERE id = 'af18';

-- F 202604-6 | 16/04/2026 | PPG / Jérémy Tourolle | 324,00€ — paiement estimé +45j = 31/05/2026
UPDATE affaires SET
  ref_facture = '202604-6', date_facture = '2026-04-16', date_echeance = '2026-05-31',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-05-31',
  updated_at = datetime('now')
WHERE id = 'af19';

-- F 202604-7 | 28/04/2026 | Concorde Club Triathlon St Saulve | 250,00€
UPDATE affaires SET
  ref_facture = '202604-7', date_facture = '2026-04-28', date_echeance = '2026-04-28',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-04-28',
  updated_at = datetime('now')
WHERE id = 'af23';

-- F 202604-8 | 30/04/2026 | NORVEL / Romain Mottet | 68,49€
UPDATE affaires SET
  ref_facture = '202604-8', date_facture = '2026-04-30', date_echeance = '2026-04-30',
  statut = 'PAYE', client_paye = 1, date_paiement_client = '2026-04-30',
  updated_at = datetime('now')
WHERE id = 'af08';

-- ── FACTURES NON PAYÉES (6 PPG En attente) ──────────────────
-- Toutes facturées le 03/06/2026 — échéance PPG +45j = 18/07/2026

-- F 202606-1 | 03/06/2026 | PPG / Brisy Mathieu | 189,00€
UPDATE affaires SET
  ref_facture = '202606-1', date_facture = '2026-06-03', date_echeance = '2026-07-18',
  statut = 'FACTURE', updated_at = datetime('now')
WHERE id = 'af12';

-- F 202606-2 | 03/06/2026 | PPG / Romain Gravelle | 327,00€
UPDATE affaires SET
  ref_facture = '202606-2', date_facture = '2026-06-03', date_echeance = '2026-07-18',
  statut = 'FACTURE', updated_at = datetime('now')
WHERE id = 'af11';

-- F 202606-3 | 03/06/2026 | PPG / FRANCOIS Stéphane | 86,78€
UPDATE affaires SET
  ref_facture = '202606-3', date_facture = '2026-06-03', date_echeance = '2026-07-18',
  statut = 'FACTURE', updated_at = datetime('now')
WHERE id = 'af10';

-- F 202606-4 | 03/06/2026 | PPG / Jeremy TOUROLLE | 244,87€
UPDATE affaires SET
  ref_facture = '202606-4', date_facture = '2026-06-03', date_echeance = '2026-07-18',
  statut = 'FACTURE', updated_at = datetime('now')
WHERE id = 'af07';

-- F 202606-5 | 03/06/2026 | PPG / Jeremy Tourolle | 127,61€
UPDATE affaires SET
  ref_facture = '202606-5', date_facture = '2026-06-03', date_echeance = '2026-07-18',
  statut = 'FACTURE', updated_at = datetime('now')
WHERE id = 'af09';

-- F 202606-6 | 03/06/2026 | PPG / Stéphane François | 482,96€
UPDATE affaires SET
  ref_facture = '202606-6', date_facture = '2026-06-03', date_echeance = '2026-07-18',
  statut = 'FACTURE', updated_at = datetime('now')
WHERE id = 'af06';

-- ── BUULD — Acompte + Solde (2 versements pour D 202603-3) ──
-- af27 reste le devis parent (900€ total, DEVIS)
-- Deux lignes enfants pour les encaissements URSSAF

-- Acompte 450€ — F 202603-9 — Payée le 27/03/2026
INSERT OR IGNORE INTO affaires (
  id, ref_devis, ref_facture, date_devis, date_facture, date_echeance,
  statut, societe, interlocuteur, designation, type,
  prix_vente_ht, delai_paiement_jours,
  fournisseur_paye, client_paye, date_paiement_client,
  affaire_parent_id, created_at, updated_at
) VALUES (
  'af27a', 'D 202603-3', '202603-9', '2026-03-07', '2026-03-27', '2026-03-27',
  'PAYE', 'BUULD', NULL, 'Acompte sur le devis 3', 'BIEN',
  450.00, 0,
  0, 1, '2026-03-27',
  'af27', datetime('now'), datetime('now')
);

-- Solde 450€ — F 202606-7 — Non payé, 2j de retard au 05/06/2026
INSERT OR IGNORE INTO affaires (
  id, ref_devis, ref_facture, date_devis, date_facture, date_echeance,
  statut, societe, interlocuteur, designation, type,
  prix_vente_ht, delai_paiement_jours,
  fournisseur_paye, client_paye,
  affaire_parent_id, created_at, updated_at
) VALUES (
  'af27b', 'D 202603-3', '202606-7', '2026-03-07', '2026-06-03', '2026-06-03',
  'FACTURE', 'BUULD', NULL, 'Solde du devis 202603-3', 'BIEN',
  450.00, 0,
  0, 0,
  'af27', datetime('now'), datetime('now')
);
