import { NextResponse } from 'next/server'

export async function GET() {
  const [blueRes, oficialRes] = await Promise.all([
    fetch('https://dolarapi.com/v1/dolares/blue', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/oficial', { cache: 'no-store' }),
  ])

  if (!blueRes.ok || !oficialRes.ok) {
    return NextResponse.json({ error: 'Error al obtener datos del dólar' }, { status: 502 })
  }

  const blue = await blueRes.json()
  const oficial = await oficialRes.json()

  return NextResponse.json({ blue, oficial })
}
