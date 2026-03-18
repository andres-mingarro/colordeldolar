import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { generarImagenDolar } from '@/lib/imagen-dolar'
import { subirImagenDrive } from '@/lib/drive'
import { fechaHoyAR } from '@/lib/fecha'
import { TIMEZONE } from '@/lib/market-hours'

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const tipo: 'inicio' | 'final' = body.tipo === 'inicio' ? 'inicio' : 'final'

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

  let buffer: Buffer
  try {
    buffer = await generarImagenDolar({ blue, oficial, fecha, tipo })
  } catch (err) {
    console.error('[imagen] Error al generar:', err)
    return NextResponse.json({ error: 'Error al generar imagen', detail: String(err) }, { status: 500 })
  }

  const dia = DIAS[new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE })).getDay()]
  const nombre = `${dia}-${tipo}.png`

  let driveError: string | null = null
  try {
    await subirImagenDrive(buffer, nombre)
  } catch (err) {
    console.error('[imagen] Error al subir a Drive:', err)
    driveError = String(err)
  }

  return NextResponse.json({
    ok: true,
    nombre,
    preview: buffer.toString('base64'),
    driveUrl: `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_FOLDER_ID}`,
    driveError,
  })
}
