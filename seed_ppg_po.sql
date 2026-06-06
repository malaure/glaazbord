-- ============================================================
-- Rapprochement PO Number PPG → affaires GlaazBoard
-- Source : screen_sales_order_search_facture@glaaz.fr1859524982.xlsx
-- Croisement par Total Amount (= prix_vente_ht) + Owner
-- Désignation = PO Number + description produit quand disponible
--
-- Résultat : 29 affaires mises à jour + 3 nouvelles affaires
-- créées (ordres PPG du 04/06/2026 sans dévis Indy connu)
-- ============================================================

-- ── MISES À JOUR DESIGNATION (29 affaires) ──────────────────

-- af36 | 300,80€ | Romain Gravelle
UPDATE affaires SET designation = 'EPO-00793382 — Autocollants vinyle',            updated_at = datetime('now') WHERE id = 'af36';
-- af35 | 152,76€ | Stéphane François
UPDATE affaires SET designation = 'EPO-00795147 — Panneau Dibond 180x60cm',        updated_at = datetime('now') WHERE id = 'af35';
-- af33 | 380,52€ | Stéphane François
UPDATE affaires SET designation = 'EPO-00797136 — Panneaux Forex 35x35cm x84',     updated_at = datetime('now') WHERE id = 'af33';
-- af34 | 1 025,00€ | Sabrina Vansuyt (commanditaire PPG)
UPDATE affaires SET designation = 'EPO-00802431',                                   updated_at = datetime('now') WHERE id = 'af34';
-- af32 | 245,00€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00804478 — Trophées étoile Plexiglas x5',   updated_at = datetime('now') WHERE id = 'af32';
-- af31 | 168,70€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00807069 — Roll-up 85x200cm x2',             updated_at = datetime('now') WHERE id = 'af31';
-- af28 | 593,97€ | Stéphane François
UPDATE affaires SET designation = 'EPO-00809726 — Panneaux Forex multi-formats x67',updated_at = datetime('now') WHERE id = 'af28';
-- af26 | 457,00€ | Romain Gravelle
UPDATE affaires SET designation = 'EPO-00814714 — Panneaux Dibond multi-formats x27',updated_at = datetime('now') WHERE id = 'af26';
-- af25 | 55,26€ | Romain Gravelle
UPDATE affaires SET designation = 'EPO-00814794 — Autocollants vinyle 120x60mm x41',updated_at = datetime('now') WHERE id = 'af25';
-- af24 | 1 297,40€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00815084 — Panneaux Dibond 990x700mm x26',   updated_at = datetime('now') WHERE id = 'af24';
-- af22 | 177,86€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00818245 — Panneau Dibond 1000x700mm x3',    updated_at = datetime('now') WHERE id = 'af22';
-- af20 | 791,00€ | Valérie Coulier (commanditaire : Sabrina Vansuyt dans PPG)
UPDATE affaires SET designation = 'EPO-00820062 — Étiquettes câble INOX x70',       updated_at = datetime('now') WHERE id = 'af20';
-- af17 | 38,40€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00820927 — Affiches 700x990mm x2',           updated_at = datetime('now') WHERE id = 'af17';
-- af18 | 175,00€ | Romain Gravelle (commanditaire PPG)
UPDATE affaires SET designation = 'EPO-00821919 — Panneaux Forex 400x600mm x14',    updated_at = datetime('now') WHERE id = 'af18';
-- af19 | 324,00€ | Romain Gravelle (commanditaire PPG)
UPDATE affaires SET designation = 'EPO-00822185 — Brochures spirales A4 x20',       updated_at = datetime('now') WHERE id = 'af19';
-- af16 | 90,35€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00822743 — Panneau Plexiglas transparent',   updated_at = datetime('now') WHERE id = 'af16';
-- af15 | 73,20€ | Stéphane François
UPDATE affaires SET designation = 'EPO-00823674 — Panneaux Forex 9 pièces',         updated_at = datetime('now') WHERE id = 'af15';
-- af14 | 19,20€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00824488 — Affiche 700x990mm x1',            updated_at = datetime('now') WHERE id = 'af14';
-- af12 | 189,00€ | Mathieu Brisy (commanditaire PPG : Romain Gravelle)
UPDATE affaires SET designation = 'EPO-00829759 — Affiches A4 Synapse x60 + maquette', updated_at = datetime('now') WHERE id = 'af12';
-- af11 | 327,00€ | Romain Gravelle
UPDATE affaires SET designation = 'EPO-00833378 — Dibond Velleda 1900x1000mm',      updated_at = datetime('now') WHERE id = 'af11';
-- af10 | 86,78€ | Stéphane François
UPDATE affaires SET designation = 'EPO-00834608 — Etiquette + Forex',               updated_at = datetime('now') WHERE id = 'af10';
-- af07 | 244,87€ | Romain Gravelle
UPDATE affaires SET designation = 'EPO-00838246 — Panneau Dibond PPG',              updated_at = datetime('now') WHERE id = 'af07';
-- af09 | 127,61€ | Romain Gravelle (commanditaire PPG)
UPDATE affaires SET designation = 'EPO-00840679 — Etiquette PPG',                   updated_at = datetime('now') WHERE id = 'af09';
-- af06 | 482,96€ | Stéphane François
UPDATE affaires SET designation = 'EPO-00841078 — 4 DIBOND + MAQUETTE',             updated_at = datetime('now') WHERE id = 'af06';
-- af05 | 945,56€ | Jeremy Tourolle (commanditaire PPG : Sabrina Vansuyt)
UPDATE affaires SET designation = 'EPO-00851277',                                   updated_at = datetime('now') WHERE id = 'af05';
-- af04 | 145,59€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00851846',                                   updated_at = datetime('now') WHERE id = 'af04';
-- af02 | 260,12€ | Sabrina Vansuyt
UPDATE affaires SET designation = 'EPO-00852517',                                   updated_at = datetime('now') WHERE id = 'af02';
-- af01 | 269,90€ | Romain Gravelle
UPDATE affaires SET designation = 'EPO-00852970',                                   updated_at = datetime('now') WHERE id = 'af01';
-- af03 | 223,10€ | Noémie Delvaux (commanditaire PPG : Sandrine Druart)
UPDATE affaires SET designation = 'EPO-00853380',                                   updated_at = datetime('now') WHERE id = 'af03';

-- ── 3 NOUVELLES AFFAIRES PPG (04/06/2026, non connues) ──────
-- Ref devis Indy inconnue — à mettre à jour depuis Indy

-- EPO-00854800 | 75,80€ | Romain Gravelle | 04/06/2026
INSERT OR IGNORE INTO affaires (
  id, ref_devis, date_devis, statut, societe, interlocuteur, designation,
  type, prix_vente_ht, delai_paiement_jours, fournisseur_paye, client_paye,
  created_at, updated_at
) VALUES (
  'af39', 'À compléter', '2026-06-04', 'DEVIS',
  'PPG France Manufacturing', 'Romain Gravelle', 'EPO-00854800',
  'BIEN', 75.80, 45, 0, 0,
  datetime('now'), datetime('now')
);

-- EPO-00854879 | 392,17€ | Romain Gravelle | 04/06/2026
INSERT OR IGNORE INTO affaires (
  id, ref_devis, date_devis, statut, societe, interlocuteur, designation,
  type, prix_vente_ht, delai_paiement_jours, fournisseur_paye, client_paye,
  created_at, updated_at
) VALUES (
  'af40', 'À compléter', '2026-06-04', 'DEVIS',
  'PPG France Manufacturing', 'Romain Gravelle', 'EPO-00854879',
  'BIEN', 392.17, 45, 0, 0,
  datetime('now'), datetime('now')
);

-- EPO-00855008 | 488,00€ | Sandrine Druart | 04/06/2026
INSERT OR IGNORE INTO affaires (
  id, ref_devis, date_devis, statut, societe, interlocuteur, designation,
  type, prix_vente_ht, delai_paiement_jours, fournisseur_paye, client_paye,
  created_at, updated_at
) VALUES (
  'af41', 'À compléter', '2026-06-04', 'DEVIS',
  'PPG France Manufacturing', 'Sandrine Druart', 'EPO-00855008',
  'BIEN', 488.00, 45, 0, 0,
  datetime('now'), datetime('now')
);
