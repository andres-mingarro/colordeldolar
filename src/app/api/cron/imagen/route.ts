import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { configuracion } from '@/db/schema'
import { generarImagenDolar } from '@/lib/imagen-dolar'
import { subirImagenDrive } from '@/lib/drive'
import { fechaHoyAR } from '@/lib/fecha'
import { TIMEZONE } from '@/lib/market-hours'

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

// Ventana en minutos dentro de la cual se genera la imagen luego de la apertura
const MINUTOS_DESPUES_APERTURA = 10
const VENTANA_MINUTOS = 6

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

  const rows = await db.select().from(configuracion)
  const cfg = Object.fromEntries(rows.map(r => [r.clave, r.valor]))

  const horaApertura = cfg.mercado_hora_apertura ?? '09:00'
  const ultimaGeneracion = cfg.imagen_ultima_generacion ?? ''

  // Fecha de hoy en AR (YYYY-MM-DD)
  const fechaHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`

  if (ultimaGeneracion === fechaHoy) {
    return NextResponse.json({ skip: 'ya generada hoy' })
  }

  const [hA, mA] = horaApertura.split(':').map(Number)
  const minutosApertura = (hA ?? 9) * 60 + (mA ?? 0)
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
  const minutosDesdeApertura = minutosAhora - minutosApertura

  if (minutosDesdeApertura < MINUTOS_DESPUES_APERTURA || minutosDesdeApertura > MINUTOS_DESPUES_APERTURA + VENTANA_MINUTOS) {
    return NextResponse.json({
      skip: `fuera de ventana`,
      minutosDesdeApertura,
      ventana: `${MINUTOS_DESPUES_APERTURA}–${MINUTOS_DESPUES_APERTURA + VENTANA_MINUTOS}`,
    })
  }

  const [blueRes, oficialRes] = await Promise.all([
    fetch('https://dolarapi.com/v1/dolares/blue', { cache: 'no-store' }),
    fetch('https://dolarapi.com/v1/dolares/oficial', { cache: 'no-store' }),
  ])

  if (!blueRes.ok || !oficialRes.ok) {
    return NextResponse.json({ error: 'Error al obtener cotizaciones' }, { status: 502 })
  }

  const blue = await blueRes.json()
  const oficial = await oficialRes.json()
  const fecha = fechaHoyAR()

  const buffer = await generarImagenDolar({ blue, oficial, fecha })
  const nombre = `${DIAS[dia]}-inicio.png`

  await subirImagenDrive(buffer, nombre)

  await db
    .insert(configuracion)
    .values([{ clave: 'imagen_ultima_generacion', valor: fechaHoy }])
    .onConflictDoUpdate({
      target: configuracion.clave,
      set: { valor: sql`excluded.valor` },
    })

  return NextResponse.json({ ok: true, nombre, fecha: fechaHoy })
}
