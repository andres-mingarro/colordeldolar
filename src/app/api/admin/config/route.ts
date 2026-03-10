import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { configuracion } from '@/db/schema'

export async function GET() {
  const rows = await db.select().from(configuracion)
  const cfg = Object.fromEntries(rows.map(r => [r.clave, r.valor]))
  return NextResponse.json({
    polling_activo:    cfg.polling_activo   ?? 'true',
    polling_intervalo: cfg.polling_intervalo ?? '1',
  })
}

export async function PUT(req: NextRequest) {
  const { polling_activo, polling_intervalo } = await req.json()

  await db
    .insert(configuracion)
    .values([
      { clave: 'polling_activo',    valor: String(polling_activo) },
      { clave: 'polling_intervalo', valor: String(polling_intervalo) },
    ])
    .onConflictDoUpdate({
      target: configuracion.clave,
      set: { valor: sql`excluded.valor` },
    })

  return NextResponse.json({ ok: true })
}
