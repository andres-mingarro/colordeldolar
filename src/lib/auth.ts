import { SignJWT, jwtVerify } from 'jose'
import { timingSafeEqual } from 'crypto'

export function secret() {
  const s = process.env.ADMIN_SECRET
  if (!s) throw new Error('ADMIN_SECRET no está definido')
  return new TextEncoder().encode(s)
}

export function verifyPassword(input: string): boolean {
  const stored = process.env.ADMIN_PASSWORD
  if (!stored) throw new Error('ADMIN_PASSWORD no está definido')
  const a = Buffer.from(input)
  const b = Buffer.from(stored)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret())
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}
