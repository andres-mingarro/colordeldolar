import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { cotizacionesDiarias } from '@/db/schema'

// Fecha de hoy en zona horaria de Argentina (UTC-3, sin DST)
function fechaHoyAR(): string {
  const now = new Date()
  const ar = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  return ar.toISOString().split('T')[0]
}

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

  // Primer insert del día → guarda apertura y cierre con el mismo valor.
  // Inserts siguientes → solo actualiza cierre (apertura queda intacta).
  const fecha = fechaHoyAR()

  db.insert(cotizacionesDiarias)
    .values([
      {
        tipo: 'blue',
        fecha,
        aperturaCompra: String(blue.compra),
        aperturaVenta:  String(blue.venta),
        cierreCompra:   String(blue.compra),
        cierreVenta:    String(blue.venta),
      },
      {
        tipo: 'oficial',
        fecha,
        aperturaCompra: String(oficial.compra),
        aperturaVenta:  String(oficial.venta),
        cierreCompra:   String(oficial.compra),
        cierreVenta:    String(oficial.venta),
      },
    ])
    .onConflictDoUpdate({
      target: [cotizacionesDiarias.tipo, cotizacionesDiarias.fecha],
      set: {
        cierreCompra: sql`excluded.cierre_compra`,
        cierreVenta:  sql`excluded.cierre_venta`,
      },
    })
    .catch((err) => console.error('[db] Error al guardar cotización:', err))

  return NextResponse.json({ blue, oficial })
}
