import type { Affaire } from '../../src/types'

interface Env { DB: D1Database }

function rowToAffaire(row: Record<string, unknown>): Affaire {
  return {
    id: row.id as string,
    refDevis: row.ref_devis as string,
    refFacture: row.ref_facture as string | undefined,
    dateDevis: row.date_devis as string | undefined,
    dateFacture: row.date_facture as string | undefined,
    statut: row.statut as Affaire['statut'],
    societe: row.societe as string,
    interlocuteur: row.interlocuteur as string | undefined,
    designation: row.designation as string,
    notes: row.notes as string | undefined,
    type: row.type as Affaire['type'],
    prixVenteHT: row.prix_vente_ht as number | undefined,
    montantBienHT: row.montant_bien_ht as number | undefined,
    montantServiceHT: row.montant_service_ht as number | undefined,
    coutAchatTTC: row.cout_achat_ttc as number | undefined,
    fournisseur: row.fournisseur as string | undefined,
    notesFournisseur: row.notes_fournisseur as string | undefined,
    delaiPaiementJours: row.delai_paiement_jours as number | undefined,
    dateEcheance: row.date_echeance as string | undefined,
    fournisseurPaye: Boolean(row.fournisseur_paye),
    datePaiementFournisseur: row.date_paiement_fournisseur as string | undefined,
    clientPaye: Boolean(row.client_paye),
    datePaiementClient: row.date_paiement_client as string | undefined,
    affaireParentId: row.affaire_parent_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM affaires ORDER BY created_at DESC'
  ).all()
  return Response.json(results.map(rowToAffaire))
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json() as Partial<Affaire>
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  await env.DB.prepare(`
    INSERT INTO affaires (
      id, ref_devis, ref_facture, date_devis, date_facture, statut,
      societe, interlocuteur, designation, notes, type,
      prix_vente_ht, montant_bien_ht, montant_service_ht, cout_achat_ttc,
      fournisseur, notes_fournisseur, delai_paiement_jours, date_echeance,
      fournisseur_paye, date_paiement_fournisseur,
      client_paye, date_paiement_client, affaire_parent_id,
      created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    id, body.refDevis, body.refFacture ?? null, body.dateDevis ?? null, body.dateFacture ?? null,
    body.statut ?? 'DEVIS', body.societe, body.interlocuteur ?? null,
    body.designation, body.notes ?? null, body.type ?? 'SERVICE',
    body.prixVenteHT ?? null, body.montantBienHT ?? null, body.montantServiceHT ?? null,
    body.coutAchatTTC ?? null, body.fournisseur ?? null, body.notesFournisseur ?? null,
    body.delaiPaiementJours ?? null, body.dateEcheance ?? null,
    body.fournisseurPaye ? 1 : 0, body.datePaiementFournisseur ?? null,
    body.clientPaye ? 1 : 0, body.datePaiementClient ?? null,
    body.affaireParentId ?? null, now, now
  ).run()

  const row = await env.DB.prepare('SELECT * FROM affaires WHERE id = ?').bind(id).first()
  return Response.json(rowToAffaire(row as Record<string, unknown>), { status: 201 })
}
