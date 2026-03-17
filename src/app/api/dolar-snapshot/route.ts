import { db } from '@/db'
import { dolarSnapshot } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const rows = await db.select().from(dolarSnapshot).where(eq(dolarSnapshot.id, 1))
  if (!rows.length) return NextResponse.json(null)
  return NextResponse.json(rows[0])
}
