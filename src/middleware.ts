import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const PUBLIC = ['/login', '/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
