import { NextResponse } from 'next/server'
import { sql, eq } from 'drizzle-orm'
import { db } from '@/db'
import { cotizacionesDiarias, dolarSnapshot } from '@/db/schema'
import { fechaHoyAR } from '@/lib/fecha'

export async function GET() {
  const [blueRes, oficialRes, mepRes, tarjetaRes, cclRes, mayoristaRes] = await Promise.all([
    fetch('https://dolarapi.com/v1/dolares/blue', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/oficial', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/bolsa', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/tarjeta', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/contadoconliqui', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/mayorista', { cache: 'no-store' }),
  ])

  if (!blueRes.ok || !oficialRes.ok) {
    return NextResponse.json({ error: 'Error al obtener datos del dólar' }, { status: 502 })
  }

  const blue = await blueRes.json()
  const oficial = await oficialRes.json()
  const mep = mepRes.ok ? await mepRes.json() : null
  const tarjeta = tarjetaRes.ok ? await tarjetaRes.json() : null
  const ccl = cclRes.ok ? await cclRes.json() : null
  const mayorista = mayoristaRes.ok ? await mayoristaRes.json() : null

  const fecha = fechaHoyAR()

  // Primer insert del día → guarda apertura y cierre con el mismo valor.
  // Inserts siguientes → solo actualiza cierre (apertura queda intacta).
  await db.insert(cotizacionesDiarias)
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

  // Actualizar snapshot solo si el precio cambió
  actualizarSnapshot({ blue, oficial, mep, tarjeta, ccl, mayorista })
    .catch((err) => console.error('[snapshot] Error al actualizar:', err))

  return NextResponse.json({ blue, oficial, mep, tarjeta, ccl, mayorista })
}

async function actualizarSnapshot(curr: {
  blue: { compra: number; venta: number }
  oficial: { compra: number; venta: number }
  mep: { compra: number; venta: number } | null
  tarjeta: { compra: number; venta: number } | null
  ccl: { compra: number; venta: number } | null
  mayorista: { compra: number; venta: number } | null
}) {
  const rows = await db.select().from(dolarSnapshot).where(eq(dolarSnapshot.id, 1))
  const prev = rows[0] ?? null

  // Si el precio no cambió, no escribir
  if (
    prev &&
    Number(prev.blueVenta)    === curr.blue.venta &&
    Number(prev.oficialVenta) === curr.oficial.venta
  ) return

  const t = (currVal: number | null, prevVal: string | null, stored: string | null): string | null => {
    if (currVal === null || prevVal === null) return stored
    if (currVal > Number(prevVal)) return 'up'
    if (currVal < Number(prevVal)) return 'down'
    return stored
  }

  const values = {
    id: 1,
    blueCompra:      String(curr.blue.compra),
    blueVenta:       String(curr.blue.venta),
    oficialCompra:   String(curr.oficial.compra),
    oficialVenta:    String(curr.oficial.venta),
    mepCompra:       curr.mep       ? String(curr.mep.compra)       : null,
    mepVenta:        curr.mep       ? String(curr.mep.venta)        : null,
    tarjetaCompra:   curr.tarjeta   ? String(curr.tarjeta.compra)   : null,
    tarjetaVenta:    curr.tarjeta   ? String(curr.tarjeta.venta)    : null,
    cclCompra:       curr.ccl       ? String(curr.ccl.compra)       : null,
    cclVenta:        curr.ccl       ? String(curr.ccl.venta)        : null,
    mayoristaCompra: curr.mayorista ? String(curr.mayorista.compra) : null,
    mayoristaVenta:  curr.mayorista ? String(curr.mayorista.venta)  : null,
    tendenciaBlue:      t(curr.blue.venta,       prev?.blueVenta      ?? null, prev?.tendenciaBlue      ?? null),
    tendenciaOficial:   t(curr.oficial.venta,     prev?.oficialVenta   ?? null, prev?.tendenciaOficial   ?? null),
    tendenciaMep:       t(curr.mep?.venta        ?? null, prev?.mepVenta       ?? null, prev?.tendenciaMep       ?? null),
    tendenciaTarjeta:   t(curr.tarjeta?.venta    ?? null, prev?.tarjetaVenta   ?? null, prev?.tendenciaTarjeta   ?? null),
    tendenciaCcl:       t(curr.ccl?.venta        ?? null, prev?.cclVenta       ?? null, prev?.tendenciaCcl       ?? null),
    tendenciaMayorista: t(curr.mayorista?.venta  ?? null, prev?.mayoristaVenta ?? null, prev?.tendenciaMayorista ?? null),
    actualizadoEn: new Date().toISOString(),
  }

  await db.insert(dolarSnapshot).values(values)
    .onConflictDoUpdate({ target: dolarSnapshot.id, set: values })
}
