import { NextResponse } from 'next/server'
import { db } from '@/db'
import { cotizaciones } from '@/db/schema'

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

  // Persiste en background sin bloquear la respuesta
  db.insert(cotizaciones).values([
    { tipo: 'blue',    compra: String(blue.compra),    venta: String(blue.venta) },
    { tipo: 'oficial', compra: String(oficial.compra), venta: String(oficial.venta) },
  ]).catch((err) => console.error('[db] Error al guardar cotización:', err))

  return NextResponse.json({ blue, oficial })
}
