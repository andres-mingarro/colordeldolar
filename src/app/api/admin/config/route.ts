import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { configuracion } from '@/db/schema'

export async function GET() {
  const rows = await db.select().from(configuracion)
  const cfg = Object.fromEntries(rows.map(r => [r.clave, r.valor]))
  return NextResponse.json({
    polling_activo:        cfg.polling_activo        ?? 'true',
    polling_intervalo:     cfg.polling_intervalo     ?? '1',
    mercado_hora_apertura: cfg.mercado_hora_apertura ?? '10:30',
    mercado_hora_cierre:   cfg.mercado_hora_cierre   ?? '17:00',
    x_post_apertura:       cfg.x_post_apertura       ?? 'false',
    x_msg_apertura:        cfg.x_msg_apertura        ?? '',
    x_post_cierre:         cfg.x_post_cierre         ?? 'false',
    x_msg_cierre:          cfg.x_msg_cierre          ?? '',
  })
}

const CLAVES_PERMITIDAS = new Set([
  'polling_activo',
  'polling_intervalo',
  'mercado_hora_apertura',
  'mercado_hora_cierre',
  'x_post_apertura',
  'x_msg_apertura',
  'x_post_cierre',
  'x_msg_cierre',
])

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const entries = Object.entries(body)
    .filter(([clave]) => CLAVES_PERMITIDAS.has(clave))
    .map(([clave, valor]) => ({
      clave,
      valor: String(valor),
    }))

  await db
    .insert(configuracion)
    .values(entries)
    .onConflictDoUpdate({
      target: configuracion.clave,
      set: { valor: sql`excluded.valor` },
    })

  return NextResponse.json({ ok: true })
}
