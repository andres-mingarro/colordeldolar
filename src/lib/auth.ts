import { SignJWT, jwtVerify } from 'jose'

function secret() {
  return new TextEncoder().encode(
    process.env.ADMIN_SECRET ?? 'dev-secret-change-in-production'
  )
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
