import { NextResponse } from 'next/server'
import { sql, eq } from 'drizzle-orm'
import { db } from '@/db'
import { cotizacionesDiarias, configuracion } from '@/db/schema'
import { fechaHoyAR } from '@/lib/fecha'
import { esDespuesCierre } from '@/lib/market-hours'
import { buildTweetText, postTweet } from '@/lib/twitter'

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

  const fecha = fechaHoyAR()

  // Detectar si es la primera cotización del día (apertura)
  const existente = await db
    .select({ tipo: cotizacionesDiarias.tipo })
    .from(cotizacionesDiarias)
    .where(eq(cotizacionesDiarias.fecha, fecha))
    .limit(1)
    .catch(() => null)

  const esApertura = existente !== null && existente.length === 0

  // Primer insert del día → guarda apertura y cierre con el mismo valor.
  // Inserts siguientes → solo actualiza cierre (apertura queda intacta).
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

  // Postear en X si corresponde (fire & forget)
  postearEnX({ blue, oficial, esApertura, fecha })
    .catch((err) => console.error('[x] Error al postear:', err))

  return NextResponse.json({ blue, oficial })
}

async function postearEnX({
  blue,
  oficial,
  esApertura,
  fecha,
}: {
  blue: { compra: number; venta: number }
  oficial: { compra: number; venta: number }
  esApertura: boolean
  fecha: string
}) {
  const configRows = await db.select().from(configuracion)
  const cfg = Object.fromEntries(configRows.map(r => [r.clave, r.valor]))

  const time = new Date().toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
  })
  const vars = {
    blueCompra: blue.compra,
    blueVenta: blue.venta,
    oficialCompra: oficial.compra,
    oficialVenta: oficial.venta,
    time,
    fecha,
  }

  if (esApertura && cfg.x_post_apertura === 'true' && cfg.x_msg_apertura) {
    await postTweet(buildTweetText(cfg.x_msg_apertura, vars))
  }

  if (
    !esApertura &&
    esDespuesCierre() &&
    cfg.x_post_cierre === 'true' &&
    cfg.x_msg_cierre &&
    cfg.x_cierre_posted !== fecha
  ) {
    await postTweet(buildTweetText(cfg.x_msg_cierre, vars))
    await db
      .insert(configuracion)
      .values({ clave: 'x_cierre_posted', valor: fecha })
      .onConflictDoUpdate({
        target: configuracion.clave,
        set: { valor: sql`excluded.valor` },
      })
  }
}
