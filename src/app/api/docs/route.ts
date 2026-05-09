import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

async function session() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  return token ? verifyToken(token) : null
}

export async function GET() {
  if (!await session()) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const { data } = await db().from('admin_docs').select('*').order('updated_at', { ascending: false })
  return Response.json(data ?? [])
}

export async function POST(request: Request) {
  const s = await session()
  if (!s) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const { title, content } = await request.json()
  if (!title?.trim()) return Response.json({ error: 'Título obrigatório' }, { status: 400 })
  const { data, error } = await db().from('admin_docs').insert({ title, content: content ?? '', updated_by: s.username }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(request: Request) {
  const s = await session()
  if (!s) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, title, content } = await request.json()
  await db().from('admin_docs').update({ title, content, updated_at: new Date().toISOString(), updated_by: s.username }).eq('id', id)
  return Response.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!await session()) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  await db().from('admin_docs').delete().eq('id', id)
  return Response.json({ ok: true })
}
