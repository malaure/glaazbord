-- ============================================================
-- Rapprochement prix d'achat fournisseur → affaires GlaazBoard
-- Source : Commandes_Production_GLAAZ_1780669889.xlsx
-- Rapprochement par n° facture Indy, puis n° devis, puis montant.
--
-- Corrections de type simultanées :
--   af27/af27a/af27b (BUULD Site internet)     : BIEN → SERVICE (achat=0, fournisseur Glaaz)
--   af23  (Concorde Grand Ch'ti Tour)           : BIEN → SERVICE (achat=0, fournisseur Glaaz)
--   af38  (GALEA Calendriers + Cartes de voeux) : SERVICE → BIEN  (achat=398,97€ print.com)
-- ============================================================

-- af38 | GALEA | Calendriers + Cartes de voeux | 598,46€
UPDATE affaires SET cout_achat_ttc = 398.97, type = 'BIEN', updated_at = datetime('now') WHERE id = 'af38';

-- af37 | GALEA | Panneaux immobiliers AkyLux x40 | 249,04€
UPDATE affaires SET cout_achat_ttc = 207.53, updated_at = datetime('now') WHERE id = 'af37';

-- af36 | PPG / Jeremy Tourolle | Autocollants vinyle | 300,80€
UPDATE affaires SET cout_achat_ttc = 209.11, updated_at = datetime('now') WHERE id = 'af36';

-- af35 | PPG / Stéphane François | Panneau Dibond 180x60cm | 152,76€
UPDATE affaires SET cout_achat_ttc = 89.35, updated_at = datetime('now') WHERE id = 'af35';

-- af33 | PPG / Stéphane François | Panneaux Forex 35x35cm x84 | 380,52€
UPDATE affaires SET cout_achat_ttc = 181.70, updated_at = datetime('now') WHERE id = 'af33';

-- af27 + enfants | BUULD | Site internet vitrine | 900€ (prestation GLAAZ, achat=0)
UPDATE affaires SET cout_achat_ttc = 0, type = 'SERVICE', updated_at = datetime('now') WHERE id = 'af27';
UPDATE affaires SET cout_achat_ttc = 0, type = 'SERVICE', updated_at = datetime('now') WHERE id = 'af27a';
UPDATE affaires SET cout_achat_ttc = 0, type = 'SERVICE', updated_at = datetime('now') WHERE id = 'af27b';

-- af32 | PPG / Sabrina Vansuyt | Trophées étoile Plexiglas x5 | 245€
UPDATE affaires SET cout_achat_ttc = 103.20, updated_at = datetime('now') WHERE id = 'af32';

-- af28 | PPG / Stéphane François | Panneaux Forex multi-formats x67 | 593,97€
UPDATE affaires SET cout_achat_ttc = 237.46, updated_at = datetime('now') WHERE id = 'af28';

-- af31 | PPG / Sabrina Vansuyt | Roll-up 85x200cm x2 | 168,70€
UPDATE affaires SET cout_achat_ttc = 78.82, updated_at = datetime('now') WHERE id = 'af31';

-- af30 | Grand Prix de Denain | Trophées Plexiglas x2 | 200€
UPDATE affaires SET cout_achat_ttc = 162.71, updated_at = datetime('now') WHERE id = 'af30';

-- af23 | Concorde Club Triathlon | Grand Ch'ti Tour 2026 identité visuelle | 250€ (prestation GLAAZ, achat=0)
UPDATE affaires SET cout_achat_ttc = 0, type = 'SERVICE', updated_at = datetime('now') WHERE id = 'af23';

-- af18 | PPG / Jeremy Tourolle | Panneaux Forex 400x600mm x14 | 175€
UPDATE affaires SET cout_achat_ttc = 69.13, updated_at = datetime('now') WHERE id = 'af18';

-- af24 | PPG / Sabrina Vansuyt | Panneaux Dibond 990x700mm x26 | 1 297,40€
UPDATE affaires SET cout_achat_ttc = 648.45, updated_at = datetime('now') WHERE id = 'af24';

-- af22 | PPG / Sabrina Vansuyt | Panneau Dibond 1000x700mm x3 | 177,86€
UPDATE affaires SET cout_achat_ttc = 97.34, updated_at = datetime('now') WHERE id = 'af22';

-- af25 | PPG / Jeremy Tourolle | Autocollants vinyle 120x60mm x41 | 55,26€
UPDATE affaires SET cout_achat_ttc = 18.42, updated_at = datetime('now') WHERE id = 'af25';

-- af26 | PPG / Jeremy Tourolle | Panneaux Dibond multi-formats x27 | 457€
UPDATE affaires SET cout_achat_ttc = 223.01, updated_at = datetime('now') WHERE id = 'af26';

-- af19 | PPG / Jeremy Tourolle | Brochures spirales A4 x20 | 324€
UPDATE affaires SET cout_achat_ttc = 253.97, updated_at = datetime('now') WHERE id = 'af19';

-- af29 | DCX Chrome / Sabrina Cucchiara | Cartes de visite x100 | 35€
UPDATE affaires SET cout_achat_ttc = 18.96, updated_at = datetime('now') WHERE id = 'af29';

-- af20 | PPG / Valérie Coulier | Étiquettes câble INOX x70 | 791€
UPDATE affaires SET cout_achat_ttc = 382.28, updated_at = datetime('now') WHERE id = 'af20';

-- af17 | PPG / Sabrina Vansuyt | Affiches 700x990mm x2 | 38,40€
UPDATE affaires SET cout_achat_ttc = 18.03, updated_at = datetime('now') WHERE id = 'af17';

-- af16 | PPG / Sabrina Vansuyt | Panneau Plexiglas transparent | 90,35€
UPDATE affaires SET cout_achat_ttc = 38.99, updated_at = datetime('now') WHERE id = 'af16';

-- af12 | PPG / Mathieu Brisy | Affiches A4 Synapse x60 + maquette | 189€
UPDATE affaires SET cout_achat_ttc = 85.64, updated_at = datetime('now') WHERE id = 'af12';

-- af15 | PPG / Stéphane François | Panneaux Forex 9 pièces | 73,20€
UPDATE affaires SET cout_achat_ttc = 33.36, updated_at = datetime('now') WHERE id = 'af15';

-- af14 | PPG / Sabrina Vansuyt | Affiche 700x990mm x1 | 19,20€
UPDATE affaires SET cout_achat_ttc = 12.22, updated_at = datetime('now') WHERE id = 'af14';

-- af11 | PPG / Romain Gravelle | Dibond Velleda 1900x1000mm | 327€
UPDATE affaires SET cout_achat_ttc = 150.59, updated_at = datetime('now') WHERE id = 'af11';

-- af10 | PPG / Stéphane François | Etiquette + Forex | 86,78€
UPDATE affaires SET cout_achat_ttc = 40.12, updated_at = datetime('now') WHERE id = 'af10';

-- af08 | NORVEL / Romain Mottet | Carte de visite | 68,49€
UPDATE affaires SET cout_achat_ttc = 29.71, updated_at = datetime('now') WHERE id = 'af08';

-- af07 | PPG / Jeremy Tourolle | Panneau Dibond PPG | 244,87€
UPDATE affaires SET cout_achat_ttc = 134.98, updated_at = datetime('now') WHERE id = 'af07';

-- af09 | PPG / Jeremy Tourolle | Etiquette PPG | 127,61€
UPDATE affaires SET cout_achat_ttc = 91.92, updated_at = datetime('now') WHERE id = 'af09';

-- af06 | PPG / Stéphane François | 4 DIBOND + MAQUETTE | 482,96€
UPDATE affaires SET cout_achat_ttc = 223.00, updated_at = datetime('now') WHERE id = 'af06';
