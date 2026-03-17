import { db } from '@/db'
import { dolarSnapshot } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const rows = await db.select().from(dolarSnapshot).where(eq(dolarSnapshot.id, 1))
  if (!rows.length) return NextResponse.json(null)
  return NextResponse.json(rows[0])
}

export async function POST(req: Request) {
  const body = await req.json()
  const {
    blueCompra, blueVenta,
    oficialCompra, oficialVenta,
    mepCompra, mepVenta,
    tarjetaCompra, tarjetaVenta,
    cclCompra, cclVenta,
    mayoristaCompra, mayoristaVenta,
  } = body

  const values = {
    id: 1,
    blueCompra, blueVenta,
    oficialCompra, oficialVenta,
    mepCompra:       mepCompra       ?? null,
    mepVenta:        mepVenta        ?? null,
    tarjetaCompra:   tarjetaCompra   ?? null,
    tarjetaVenta:    tarjetaVenta    ?? null,
    cclCompra:       cclCompra       ?? null,
    cclVenta:        cclVenta        ?? null,
    mayoristaCompra: mayoristaCompra ?? null,
    mayoristaVenta:  mayoristaVenta  ?? null,
    actualizadoEn: new Date().toISOString(),
  }

  await db
    .insert(dolarSnapshot)
    .values(values)
    .onConflictDoUpdate({ target: dolarSnapshot.id, set: values })

  return NextResponse.json({ ok: true })
}
