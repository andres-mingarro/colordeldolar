import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/admin/login', '/api/admin/login']

function secret() {
  return new TextEncoder().encode(
    process.env.ADMIN_SECRET ?? 'dev-secret-change-in-production'
  )
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  const token = req.cookies.get('admin_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    await jwtVerify(token, secret())
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
