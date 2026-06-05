import type { Client } from '../../../src/types'

interface Env { DB: D1Database }

export const onRequestPut: PagesFunction<Env> = async ({ env, request, params }) => {
  const body = await request.json() as Partial<Client>
  await env.DB.prepare(
    'UPDATE clients SET societe=?, interlocuteurs=?, delai_paiement_jours=?, notes=? WHERE id=?'
  ).bind(
    body.societe, JSON.stringify(body.interlocuteurs ?? []),
    body.delaiPaiementJours ?? 30, body.notes ?? null, params.id
  ).run()

  const row = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(params.id).first()
  const c = row as Record<string, unknown>
  return Response.json({
    id: c.id, societe: c.societe,
    interlocuteurs: JSON.parse(c.interlocuteurs as string),
    delaiPaiementJours: c.delai_paiement_jours, notes: c.notes, createdAt: c.created_at,
  })
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  await env.DB.prepare('DELETE FROM clients WHERE id = ?').bind(params.id).run()
  return Response.json({ ok: true })
}
