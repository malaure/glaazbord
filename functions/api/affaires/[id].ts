import type { Affaire } from '../../../src/types'

interface Env { DB: D1Database }

function rowToAffaire(row: Record<string, unknown>): Affaire {
  return {
    id: row.id as string,
    refDevis: row.ref_devis as string,
    refFacture: row.ref_facture as string | undefined,
    dateDevis: row.date_devis as string | undefined,
    dateFacture: row.date_facture as string | undefined,
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
    statutProd: row.statut_prod as Affaire['statutProd'] | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request, params }) => {
  const id = params.id as string
  const body = await request.json() as Partial<Affaire>
  const now = new Date().toISOString()

  await env.DB.prepare(`
    UPDATE affaires SET
      ref_devis=?, ref_facture=?, date_devis=?, date_facture=?,
      societe=?, interlocuteur=?, designation=?, notes=?, type=?,
      prix_vente_ht=?, montant_bien_ht=?, montant_service_ht=?, cout_achat_ttc=?,
      fournisseur=?, notes_fournisseur=?, delai_paiement_jours=?, date_echeance=?,
      fournisseur_paye=?, date_paiement_fournisseur=?,
      client_paye=?, date_paiement_client=?, affaire_parent_id=?,
      statut_prod=?, updated_at=?
    WHERE id=?
  `).bind(
    body.refDevis, body.refFacture ?? null, body.dateDevis ?? null, body.dateFacture ?? null,
    body.societe, body.interlocuteur ?? null,
    body.designation, body.notes ?? null, body.type,
    body.prixVenteHT ?? null, body.montantBienHT ?? null, body.montantServiceHT ?? null,
    body.coutAchatTTC ?? null, body.fournisseur ?? null, body.notesFournisseur ?? null,
    body.delaiPaiementJours ?? null, body.dateEcheance ?? null,
    body.fournisseurPaye ? 1 : 0, body.datePaiementFournisseur ?? null,
    body.clientPaye ? 1 : 0, body.datePaiementClient ?? null,
    body.affaireParentId ?? null, body.statutProd ?? 'COMMANDE_RECUE', now, id
  ).run()

  const row = await env.DB.prepare('SELECT * FROM affaires WHERE id = ?').bind(id).first()
  return Response.json(rowToAffaire(row as Record<string, unknown>))
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  await env.DB.prepare('DELETE FROM affaires WHERE id = ?').bind(params.id).run()
  return Response.json({ ok: true })
}
