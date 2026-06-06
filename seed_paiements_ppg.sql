-- ============================================================
-- Dates de paiement réelles PPG — Supplier Portal Invoice Export
-- Source : screen_supplier_portal_invoice_search_facture@glaaz.fr
-- Remplace les estimations (date_facture + 45j) par les vraies dates
-- Les dates d'échéance étaient déjà exactes — seul date_paiement_client change
-- ============================================================

-- af36 | 202602-2 | EPO-00793382 | 300,80€ | Due 30/03 | Payé le 27/03/2026
UPDATE affaires SET date_paiement_client = '2026-03-27', updated_at = datetime('now') WHERE id = 'af36';

-- af35 | 202602-3 | EPO-00795147 | 152,76€ | Due 09/04 | Payé le 08/04/2026
UPDATE affaires SET date_paiement_client = '2026-04-08', updated_at = datetime('now') WHERE id = 'af35';

-- af33 | 202602-4 | EPO-00797136 | 380,52€ | Due 09/04 | Payé le 08/04/2026
UPDATE affaires SET date_paiement_client = '2026-04-08', updated_at = datetime('now') WHERE id = 'af33';

-- af32 | 202603-1 | EPO-00804478 | 245,00€ | Due 26/04 | Payé le 24/04/2026
UPDATE affaires SET date_paiement_client = '2026-04-24', updated_at = datetime('now') WHERE id = 'af32';

-- af31 | 202603-3 | EPO-00807069 | 168,70€ | Due 26/04 | Payé le 24/04/2026
UPDATE affaires SET date_paiement_client = '2026-04-24', updated_at = datetime('now') WHERE id = 'af31';

-- af28 | 202603-2 | EPO-00809726 | 593,97€ | Due 26/04 | Payé le 24/04/2026
UPDATE affaires SET date_paiement_client = '2026-04-24', updated_at = datetime('now') WHERE id = 'af28';

-- af26 | 202603-5 | EPO-00814714 | 457,00€ | Due 09/05 | Payé le 07/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-07', updated_at = datetime('now') WHERE id = 'af26';

-- af25 | 202603-6 | EPO-00814794 | 55,26€  | Due 09/05 | Payé le 07/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-07', updated_at = datetime('now') WHERE id = 'af25';

-- af24 | 202603-7 | EPO-00815084 | 1 297,40€ | Due 09/05 | Payé le 07/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-07', updated_at = datetime('now') WHERE id = 'af24';

-- af22 | 202603-8 | EPO-00818245 | 177,86€ | Due 09/05 | Payé le 07/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-07', updated_at = datetime('now') WHERE id = 'af22';

-- af20 | 202603-11 | EPO-00820062 | 791,00€ | Due 14/05 | Payé le 13/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-13', updated_at = datetime('now') WHERE id = 'af20';

-- af17 | 202604-1 | EPO-00820927 | 38,40€  | Due 16/05 | Payé le 15/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-15', updated_at = datetime('now') WHERE id = 'af17';

-- af16 | 202604-2 | EPO-00822743 | 90,35€  | Due 28/05 | Payé le 22/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-22', updated_at = datetime('now') WHERE id = 'af16';

-- af15 | 202604-3 | EPO-00823674 | 73,20€  | Due 28/05 | Payé le 22/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-22', updated_at = datetime('now') WHERE id = 'af15';

-- af14 | 202604-4 | EPO-00824488 | 19,20€  | Due 28/05 | Payé le 22/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-22', updated_at = datetime('now') WHERE id = 'af14';

-- af18 | 202604-5 | EPO-00821919 | 175,00€ | Due 31/05 | Payé le 27/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-27', updated_at = datetime('now') WHERE id = 'af18';

-- af19 | 202604-6 | EPO-00822185 | 324,00€ | Due 31/05 | Payé le 27/05/2026
UPDATE affaires SET date_paiement_client = '2026-05-27', updated_at = datetime('now') WHERE id = 'af19';
