import type { Client } from '../../src/types'

interface Env { DB: D1Database }

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    societe: row.societe as string,
    interlocuteurs: JSON.parse(row.interlocuteurs as string),
    delaiPaiementJours: row.delai_paiement_jours as number,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare('SELECT * FROM clients ORDER BY societe ASC').all()
  return Response.json(results.map(rowToClient))
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json() as Partial<Client>
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await env.DB.prepare(
    'INSERT INTO clients (id, societe, interlocuteurs, delai_paiement_jours, notes, created_at) VALUES (?,?,?,?,?,?)'
  ).bind(
    id, body.societe, JSON.stringify(body.interlocuteurs ?? []),
    body.delaiPaiementJours ?? 30, body.notes ?? null, now
  ).run()

  const row = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first()
  return Response.json(rowToClient(row as Record<string, unknown>), { status: 201 })
}
