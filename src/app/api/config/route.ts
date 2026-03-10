import { NextResponse } from 'next/server'
import { db } from '@/db'
import { configuracion } from '@/db/schema'

export async function GET() {
  const rows = await db.select().from(configuracion)
  const cfg = Object.fromEntries(rows.map(r => [r.clave, r.valor]))
  return NextResponse.json({
    polling_activo:        cfg.polling_activo   !== 'false',
    polling_intervalo:     Number(cfg.polling_intervalo ?? '1'),
    mercado_hora_apertura: cfg.mercado_hora_apertura ?? '09:00',
    mercado_hora_cierre:   cfg.mercado_hora_cierre   ?? '18:00',
  })
}
