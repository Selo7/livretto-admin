import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

async function session() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  return token ? verifyToken(token) : null
}

export async function GET(request: Request) {
  if (!await session()) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = db()
    .from('admin_crm')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data } = await query
  return Response.json(data ?? [])
}

export async function POST(request: Request) {
  if (!await session()) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await request.json()
  const { name, email, phone, status, notes } = body
  if (!name?.trim()) return Response.json({ error: 'Nome obrigatório' }, { status: 400 })

  const { data, error } = await db()
    .from('admin_crm')
    .insert({ name: name.trim(), email, phone, status: status ?? 'lead', notes })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(request: Request) {
  if (!await session()) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, ...fields } = await request.json()
  if (!id) return Response.json({ error: 'ID obrigatório' }, { status: 400 })

  const { error } = await db()
    .from('admin_crm')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!await session()) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  await db().from('admin_crm').delete().eq('id', id)
  return Response.json({ ok: true })
}
