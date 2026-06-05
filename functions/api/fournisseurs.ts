import type { Fournisseur } from '../../src/types'

interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare('SELECT * FROM fournisseurs ORDER BY nom ASC').all()
  return Response.json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json() as Partial<Fournisseur>
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await env.DB.prepare(
    'INSERT INTO fournisseurs (id, nom, notes, created_at) VALUES (?,?,?,?)'
  ).bind(id, body.nom, body.notes ?? null, now).run()

  const row = await env.DB.prepare('SELECT * FROM fournisseurs WHERE id = ?').bind(id).first()
  return Response.json(row, { status: 201 })
}
