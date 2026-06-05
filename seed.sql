-- Clients GLAAZ
INSERT OR IGNORE INTO clients (id, societe, interlocuteurs, delai_paiement_jours, notes, created_at) VALUES
  ('c1', 'PPG France Manufacturing', '["Jeremy Tourolle","Stéphane François","Sabrina Vansuyt","Romain Gravelle","Mathieu Brisy","Valérie Coulier","Sandrine Druart"]', 45, NULL, datetime('now')),
  ('c2', 'GALEA Immobilier', '["Julien Brouillard"]', 0, 'À réception', datetime('now')),
  ('c3', 'Mairie de Marly', '["Lucie Jamain"]', 0, 'À réception', datetime('now')),
  ('c4', 'BUULD', '["Jean-François Despinoy"]', 0, 'À réception', datetime('now')),
  ('c5', 'NORVEL', '["Romain Mottet"]', 0, 'À réception', datetime('now')),
  ('c6', 'Concorde Club Triathlon St Saulve', '["Romain Mottet"]', 0, 'À réception', datetime('now')),
  ('c7', 'DCX Chrome', '["Sabrina Cucchiara"]', 45, NULL, datetime('now')),
  ('c8', 'Grand Prix de Denain', '["Valérie Moreau"]', 0, 'À réception', datetime('now'));

-- Fournisseurs GLAAZ
INSERT OR IGNORE INTO fournisseurs (id, nom, notes, created_at) VALUES
  ('f1', 'print.com', 'Principal — Dibond, Forex, affiches, roll-up, autocollants, CDV…', datetime('now')),
  ('f2', '123 Panneaux', 'Panneaux immobiliers AkyLux, tableaux', datetime('now')),
  ('f3', 'Realisaprint', 'Trophées Plexiglas', datetime('now')),
  ('f4', 'Plaque en direct', 'Étiquettes câble INOX', datetime('now')),
  ('f5', 'ABC Marquage', 'Polos (commande vêtements)', datetime('now')),
  ('f6', 'Imbretex', 'Polos (commande vêtements)', datetime('now')),
  ('f7', 'Glaaz', 'Prestations internes (service, pas d''achat fournisseur)', datetime('now'));
