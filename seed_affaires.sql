-- Ajout Noémie Delvaux aux interlocuteurs PPG
UPDATE clients
SET interlocuteurs = '["Jeremy Tourolle","Stéphane François","Sabrina Vansuyt","Romain Gravelle","Mathieu Brisy","Valérie Coulier","Sandrine Druart","Noémie Delvaux"]'
WHERE id = 'c1';

-- 38 affaires signées (statut DEVIS — à mettre à jour selon factures et paiements)
-- prix_vente_ht = Total TTC affiché dans Indy (= HT car franchise TVA, pas de TVA)
-- type BIEN par défaut sauf NORVEL 202603-9 (SERVICE création identité visuelle)
-- coût d'achat à compléter pour chaque affaire

INSERT OR IGNORE INTO affaires (
  id, ref_devis, date_devis, statut,
  societe, interlocuteur, designation,
  type, prix_vente_ht, delai_paiement_jours,
  fournisseur_paye, client_paye,
  created_at, updated_at
) VALUES
-- Juin 2026
('af01', 'D 202606-1',  '2026-06-01', 'DEVIS', 'PPG France Manufacturing', 'Romain Gravelle',   'Gravelle Romain',                     'BIEN',    269.90, 45, 0, 0, datetime('now'), datetime('now')),
-- Mai 2026
('af02', 'D 202605-10', '2026-05-29', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',    260.12, 45, 0, 0, datetime('now'), datetime('now')),
('af03', 'D 202605-11', '2026-05-28', 'DEVIS', 'PPG France Manufacturing', 'Noémie Delvaux',    'DELVAUX Noémie',                      'BIEN',    223.10, 45, 0, 0, datetime('now'), datetime('now')),
('af04', 'D 202605-9',  '2026-05-28', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',    145.59, 45, 0, 0, datetime('now'), datetime('now')),
('af05', 'D 202605-4',  '2026-05-28', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jeremy TOUROLLE',                     'BIEN',    945.56, 45, 0, 0, datetime('now'), datetime('now')),
('af06', 'D 202605-2',  '2026-05-06', 'DEVIS', 'PPG France Manufacturing', 'Stéphane François', 'Stéphane François',                   'BIEN',    482.96, 45, 0, 0, datetime('now'), datetime('now')),
-- Avril 2026
('af07', 'D 202604-15', '2026-04-29', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jeremy TOUROLLE',                     'BIEN',    244.87, 45, 0, 0, datetime('now'), datetime('now')),
('af08', 'D 202604-14', '2026-04-24', 'DEVIS', 'NORVEL',                   'Romain Mottet',     'À compléter',                         'BIEN',     68.49,  0, 0, 0, datetime('now'), datetime('now')),
('af09', 'D 202604-13', '2026-04-23', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jeremy Tourolle',                     'BIEN',    127.61, 45, 0, 0, datetime('now'), datetime('now')),
('af10', 'D 202604-12', '2026-04-21', 'DEVIS', 'PPG France Manufacturing', 'Stéphane François', 'FRANCOIS Stéphane',                   'BIEN',     86.78, 45, 0, 0, datetime('now'), datetime('now')),
('af11', 'D 202604-10', '2026-04-16', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jérémy Tourolle',                     'BIEN',    327.00, 45, 0, 0, datetime('now'), datetime('now')),
('af12', 'D 202604-9',  '2026-04-13', 'DEVIS', 'PPG France Manufacturing', 'Mathieu Brisy',     'Brisy Mathieu',                       'BIEN',    189.00, 45, 0, 0, datetime('now'), datetime('now')),
('af13', 'D 202604-4',  '2026-04-08', 'DEVIS', 'Mairie de Marly',          NULL,                'Housse pour barrière Vauban',         'BIEN',    636.00,  0, 0, 0, datetime('now'), datetime('now')),
('af14', 'D 202604-1',  '2026-04-01', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',     19.20, 45, 0, 0, datetime('now'), datetime('now')),
-- Mars 2026
('af15', 'D 202603-16', '2026-03-31', 'DEVIS', 'PPG France Manufacturing', 'Stéphane François', 'FRANCOIS Stéphane',                   'BIEN',     73.20, 45, 0, 0, datetime('now'), datetime('now')),
('af16', 'D 202603-15', '2026-03-30', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',     90.35, 45, 0, 0, datetime('now'), datetime('now')),
('af17', 'D 202603-13', '2026-03-25', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',     38.40, 45, 0, 0, datetime('now'), datetime('now')),
('af18', 'D 202603-12', '2026-03-25', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jérémy Tourolle',                     'BIEN',    175.00, 45, 0, 0, datetime('now'), datetime('now')),
('af19', 'D 202603-11', '2026-03-25', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jérémy Tourolle',                     'BIEN',    324.00, 45, 0, 0, datetime('now'), datetime('now')),
('af20', 'D 202603-10', '2026-04-24', 'DEVIS', 'PPG France Manufacturing', 'Valérie Coulier',   'Valérie COULIER',                     'BIEN',    791.00, 45, 0, 0, datetime('now'), datetime('now')),
('af21', 'D 202603-9',  '2026-03-23', 'DEVIS', 'NORVEL',                   'Romain Mottet',     'Création identité visuelle',          'SERVICE', 1490.00, 0, 0, 0, datetime('now'), datetime('now')),
('af22', 'D 202603-8',  '2026-03-19', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',    177.86, 45, 0, 0, datetime('now'), datetime('now')),
('af23', 'D 202603-7',  '2026-03-13', 'DEVIS', 'Concorde Club Triathlon St Saulve', NULL,       'À compléter',                         'BIEN',    250.00,  0, 0, 0, datetime('now'), datetime('now')),
('af24', 'D 202603-6',  '2026-03-13', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',   1297.40, 45, 0, 0, datetime('now'), datetime('now')),
('af25', 'D 202603-5',  '2026-03-12', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jeremy TOUROLLE',                     'BIEN',     55.26, 45, 0, 0, datetime('now'), datetime('now')),
('af26', 'D 202603-4',  '2026-03-11', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jeremy Tourolle',                     'BIEN',    457.00, 45, 0, 0, datetime('now'), datetime('now')),
('af27', 'D 202603-3',  '2026-03-07', 'DEVIS', 'BUULD',                    NULL,                'À compléter',                         'BIEN',    900.00,  0, 0, 0, datetime('now'), datetime('now')),
('af28', 'D 202603-2',  '2026-03-04', 'DEVIS', 'PPG France Manufacturing', 'Stéphane François', 'FRANCOIS Stéphane',                   'BIEN',    593.97, 45, 0, 0, datetime('now'), datetime('now')),
('af29', 'D 202603-1',  '2026-03-02', 'DEVIS', 'DCX Chrome',               'Sabrina Cucchiara', 'Sabrina Cucchiara',                   'BIEN',     35.00, 45, 0, 0, datetime('now'), datetime('now')),
-- Février 2026
('af30', 'D 202602-7',  '2026-02-27', 'DEVIS', 'Grand Prix de Denain',     NULL,                'À compléter',                         'BIEN',    200.00,  0, 0, 0, datetime('now'), datetime('now')),
('af31', 'D 202602-6',  '2026-02-26', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',    168.70, 45, 0, 0, datetime('now'), datetime('now')),
('af32', 'D 202602-5',  '2026-02-23', 'DEVIS', 'PPG France Manufacturing', 'Sabrina Vansuyt',   'Sabrina Vansuyt',                     'BIEN',    245.00, 45, 0, 0, datetime('now'), datetime('now')),
('af33', 'D 202602-3',  '2026-02-06', 'DEVIS', 'PPG France Manufacturing', 'Stéphane François', 'FRANCOIS Stéphane',                   'BIEN',    380.52, 45, 0, 0, datetime('now'), datetime('now')),
('af34', 'D 202602-2',  '2026-02-06', 'DEVIS', 'PPG France Manufacturing', 'Mathieu Brisy',     'Mathieu BRISY',                       'BIEN',   1025.00, 45, 0, 0, datetime('now'), datetime('now')),
('af35', 'D 202602-1',  '2026-02-04', 'DEVIS', 'PPG France Manufacturing', 'Stéphane François', 'Stéphane FRANÇOIS',                   'BIEN',    152.76, 45, 0, 0, datetime('now'), datetime('now')),
-- Janvier 2026
('af36', 'D 202601-3',  '2026-01-30', 'DEVIS', 'PPG France Manufacturing', 'Jeremy Tourolle',   'Jeremy TOUROLLE',                     'BIEN',    300.80, 45, 0, 0, datetime('now'), datetime('now')),
('af37', 'D 202601-2',  '2026-01-23', 'DEVIS', 'GALEA Immobilier',         NULL,                'Panneau Loué par l''agence',          'BIEN',    249.04,  0, 0, 0, datetime('now'), datetime('now')),
('af38', 'D 202601-1',  '2026-01-22', 'DEVIS', 'GALEA Immobilier',         NULL,                'Calendrier / Carte de voeux',         'SERVICE', 598.46,  0, 0, 0, datetime('now'), datetime('now'));
