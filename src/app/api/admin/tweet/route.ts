import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { configuracion } from '@/db/schema'
import { verifyAdminToken } from '@/lib/auth'
import { buildTweetText, postTweet } from '@/lib/twitter'
import { TIMEZONE } from '@/lib/market-hours'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const template: string = body.template
  if (!template) {
    return NextResponse.json({ error: 'Falta template' }, { status: 400 })
  }

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

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
  const time = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const fecha = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

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

  let tweetId: string
  try {
    tweetId = await postTweet(texto)
  } catch (err) {
    console.error('[tweet] Error al postear:', err)
    return NextResponse.json({ error: 'Error al postear en X', detail: String(err) }, { status: 500 })
  }

  await db
    .insert(configuracion)
    .values({ clave: 'x_ultimo_tweet_id', valor: tweetId })
    .onConflictDoUpdate({
      target: configuracion.clave,
      set: { valor: sql`excluded.valor` },
    })

  return NextResponse.json({ ok: true })
}
