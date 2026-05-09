import { cookies } from 'next/headers'
import { verifyToken, hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  return token ? verifyToken(token) : null
}

// GET — lista todos os admins
export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { data } = await db()
    .from('admin_users')
    .select('id, username, created_by, created_at')
    .order('created_at')

  return Response.json(data ?? [])
}

// POST — cria novo admin (apenas brunomassa)
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  if (session.username !== 'brunomassa') {
    return Response.json({ error: 'Apenas brunomassa pode criar usuários' }, { status: 403 })
  }

  const { username } = await request.json()
  if (!username?.trim()) return Response.json({ error: 'Username obrigatório' }, { status: 400 })

  const { error } = await db()
    .from('admin_users')
    .insert({ username: username.trim(), created_by: session.username })

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}

// DELETE — remove admin (apenas brunomassa, não pode remover a si mesmo)
export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  if (session.username !== 'brunomassa') {
    return Response.json({ error: 'Apenas brunomassa pode remover usuários' }, { status: 403 })
  }

  const { id, username } = await request.json()
  if (username === 'brunomassa') {
    return Response.json({ error: 'Não é possível remover o usuário principal' }, { status: 400 })
  }

  await db().from('admin_users').delete().eq('id', id)
  return Response.json({ ok: true })
}

// PATCH — reseta senha de um usuário (apenas brunomassa)
export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  if (session.username !== 'brunomassa') {
    return Response.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await request.json()
  // Limpa o hash → forçará novo primeiro acesso
  await db().from('admin_users').update({ password_hash: null }).eq('id', id)
  return Response.json({ ok: true })
}
