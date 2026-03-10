import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { generarImagenDolar } from '@/lib/imagen-dolar'
import { subirImagenDrive } from '@/lib/drive'
import { fechaHoyAR } from '@/lib/fecha'

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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

  const dia = DIAS[new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })).getDay()]
  const nombre = `${dia}.png`

  await subirImagenDrive(buffer, nombre)

  return NextResponse.json({ ok: true, nombre, preview: buffer.toString('base64') })
}
