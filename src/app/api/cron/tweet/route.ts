import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { configuracion } from '@/db/schema'
import { buildTweetText, postTweet } from '@/lib/twitter'
import { fechaHoyAR } from '@/lib/fecha'
import { TIMEZONE } from '@/lib/market-hours'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
  const dia = ahora.getDay()
  if (dia === 0 || dia === 6) {
    return NextResponse.json({ skip: 'fin de semana' })
  }

  const tipo = req.nextUrl.searchParams.get('tipo') as 'apertura' | 'cierre' | null
  if (tipo !== 'apertura' && tipo !== 'cierre') {
    return NextResponse.json({ error: 'tipo debe ser apertura o cierre' }, { status: 400 })
  }

  const rows = await db.select().from(configuracion)
  const cfg = Object.fromEntries(rows.map(r => [r.clave, r.valor]))

  const switchKey = tipo === 'apertura' ? 'x_post_apertura' : 'x_post_cierre'
  const msgKey    = tipo === 'apertura' ? 'x_msg_apertura'  : 'x_msg_cierre'
  const guardKey  = tipo === 'apertura' ? 'x_apertura_posted' : 'x_cierre_posted'

  if (cfg[switchKey] !== 'true') {
    return NextResponse.json({ skip: `${tipo} desactivado` })
  }

  const fechaHoy = fechaHoyAR()
  if (cfg[guardKey] === fechaHoy) {
    return NextResponse.json({ skip: `ya posteado hoy (${tipo})` })
  }

  const template = cfg[msgKey]
  if (!template) {
    return NextResponse.json({ error: 'sin template' }, { status: 400 })
  }

  // Marcar como posteado antes de postear para evitar duplicados en caso de reintentos
  await db
    .insert(configuracion)
    .values({ clave: guardKey, valor: fechaHoy })
    .onConflictDoUpdate({
      target: configuracion.clave,
      set: { valor: sql`excluded.valor` },
    })

  const [blueRes, oficialRes, bolsaRes, tarjetaRes, cclRes, mayoristaRes] = await Promise.all([
    fetch('https://dolarapi.com/v1/dolares/blue', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/oficial', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/bolsa', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/tarjeta', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/contadoconliqui', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/mayorista', { cache: 'no-store' }),
  ])

  if (!blueRes.ok || !oficialRes.ok) {
    return NextResponse.json({ error: 'Error al obtener cotizaciones' }, { status: 502 })
  }

  const [blue, oficial, bolsa, tarjeta, ccl, mayorista] = await Promise.all([
    blueRes.json(), oficialRes.json(),
    bolsaRes.ok ? bolsaRes.json() : null,
    tarjetaRes.ok ? tarjetaRes.json() : null,
    cclRes.ok ? cclRes.json() : null,
    mayoristaRes.ok ? mayoristaRes.json() : null,
  ])

  const time = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const fecha = ahora.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const texto = buildTweetText(template, {
    blueCompra: blue.compra,
    blueVenta: blue.venta,
    oficialCompra: oficial.compra,
    oficialVenta: oficial.venta,
    bolsaCompra: bolsa?.compra ?? '',
    bolsaVenta: bolsa?.venta ?? '',
    tarjetaCompra: tarjeta?.compra ?? '',
    tarjetaVenta: tarjeta?.venta ?? '',
    cclCompra: ccl?.compra ?? '',
    cclVenta: ccl?.venta ?? '',
    mayoristaCompra: mayorista?.compra ?? '',
    mayoristaVenta: mayorista?.venta ?? '',
    time,
    fecha,
  })

  await postTweet(texto)

  return NextResponse.json({ ok: true, tipo, fecha: fechaHoy })
}
