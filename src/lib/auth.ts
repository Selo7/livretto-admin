// Autenticação do painel admin — cookie com HMAC-SHA256, sem dependências extras.
// Token: base64url(json) + "." + hex(HMAC)

export const COOKIE_NAME = 'admin_session'
const TTL_MS = 8 * 60 * 60 * 1000 // 8 horas

async function hmacKey() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET não definido')
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function toB64(s: string) {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
function fromB64(s: string) {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'))
}
function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
function fromHex(hex: string) {
  const m = hex.match(/.{2}/g)
  if (!m) throw new Error('hex inválido')
  return new Uint8Array(m.map(b => parseInt(b, 16)))
}

export async function signToken(username: string): Promise<string> {
  const key = await hmacKey()
  const payload = toB64(JSON.stringify({ username, exp: Date.now() + TTL_MS }))
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${toHex(sig)}`
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const dot = token.lastIndexOf('.')
    const payload = token.slice(0, dot)
    const sigHex = token.slice(dot + 1)
    const key = await hmacKey()
    const valid = await crypto.subtle.verify('HMAC', key, fromHex(sigHex), new TextEncoder().encode(payload))
    if (!valid) return null
    const data = JSON.parse(fromB64(payload))
    if (data.exp < Date.now()) return null
    return { username: data.username }
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = process.env.ADMIN_JWT_SECRET ?? ''
  const data = new TextEncoder().encode(salt + ':' + password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return toHex(hash)
}
