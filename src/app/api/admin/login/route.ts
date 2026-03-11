import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken, verifyPassword } from '@/lib/auth'

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    })
    if (!res.ok) return false
    const data = await res.json() as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const { username, password, turnstileToken } = await req.json()

  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const turnstileOk = turnstileToken ? await verifyTurnstile(turnstileToken, ip) : false

  if (!turnstileOk) {
    return NextResponse.json({ error: 'Verificación fallida' }, { status: 403 })
  }

  const validUser = username === (process.env.ADMIN_USERNAME ?? 'admin')
  const validPass = verifyPassword(password)

  if (!validUser || !validPass) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const token = await createAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return res
}
