import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth'

// POST /api/auth — login (primeiro acesso define a senha)
export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return Response.json({ error: 'Usuário e senha obrigatórios' }, { status: 400 })
  }

  const { data: user, error } = await db()
    .from('admin_users')
    .select('id, username, password_hash')
    .eq('username', username)
    .single()

  if (error || !user) {
    return Response.json({ error: 'Usuário não encontrado' }, { status: 401 })
  }

  const hash = await hashPassword(password)

  if (!user.password_hash) {
    // Primeiro acesso — salva a senha
    await db().from('admin_users').update({ password_hash: hash }).eq('id', user.id)
  } else if (user.password_hash !== hash) {
    return Response.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const token = await signToken(user.username)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })

  return Response.json({ ok: true })
}

// DELETE /api/auth — logout
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return Response.json({ ok: true })
}
