import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { configuracion } from '@/db/schema'
import { generarImagenDolar } from '@/lib/imagen-dolar'
import { subirImagenDrive } from '@/lib/drive'
import { fechaHoyAR } from '@/lib/fecha'
import { TIMEZONE } from '@/lib/market-hours'

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

// Ventana en minutos dentro de la cual se acepta la ejecución del cron
const MINUTOS_DESPUES = 10
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
  const horaCierre = cfg.mercado_hora_cierre ?? '18:00'

  const fechaHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()

  const [hA, mA] = horaApertura.split(':').map(Number)
  const minutosApertura = (hA ?? 9) * 60 + (mA ?? 0)
  const minutosDesdeApertura = minutosAhora - minutosApertura

  const [hC, mC] = horaCierre.split(':').map(Number)
  const minutosCierre = (hC ?? 18) * 60 + (mC ?? 0)
  const minutosDeadeCierre = minutosAhora - minutosCierre

  const esVentanaInicio = minutosDesdeApertura >= MINUTOS_DESPUES && minutosDesdeApertura <= MINUTOS_DESPUES + VENTANA_MINUTOS
  const esVentanaCierre = minutosDeadeCierre >= MINUTOS_DESPUES && minutosDeadeCierre <= MINUTOS_DESPUES + VENTANA_MINUTOS

  if (!esVentanaInicio && !esVentanaCierre) {
    return NextResponse.json({
      skip: 'fuera de ventana',
      minutosDesdeApertura,
      minutosDeadeCierre,
      ventana: `${MINUTOS_DESPUES}–${MINUTOS_DESPUES + VENTANA_MINUTOS} min después de apertura o cierre`,
    })
  }

  const tipo = esVentanaInicio ? 'inicio' : 'final'
  const guardKey = tipo === 'inicio' ? 'imagen_ultima_generacion' : 'imagen_cierre_ultima_generacion'

  if (cfg[guardKey] === fechaHoy) {
    return NextResponse.json({ skip: `ya generada hoy (${tipo})` })
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

  const buffer = await generarImagenDolar({ blue, oficial, fecha, tipo })
  const nombre = `${DIAS[dia]}-${tipo}.png`

  await subirImagenDrive(buffer, nombre)

  await db
    .insert(configuracion)
    .values([{ clave: guardKey, valor: fechaHoy }])
    .onConflictDoUpdate({
      target: configuracion.clave,
      set: { valor: sql`excluded.valor` },
    })

  return NextResponse.json({ ok: true, nombre, tipo, fecha: fechaHoy })
}
