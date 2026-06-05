import type { Fournisseur } from '../../../src/types'

interface Env { DB: D1Database }

export const onRequestPut: PagesFunction<Env> = async ({ env, request, params }) => {
  const body = await request.json() as Partial<Fournisseur>
  await env.DB.prepare('UPDATE fournisseurs SET nom=?, notes=? WHERE id=?')
    .bind(body.nom, body.notes ?? null, params.id).run()
  const row = await env.DB.prepare('SELECT * FROM fournisseurs WHERE id = ?').bind(params.id).first()
  return Response.json(row)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  await env.DB.prepare('DELETE FROM fournisseurs WHERE id = ?').bind(params.id).run()
  return Response.json({ ok: true })
}
