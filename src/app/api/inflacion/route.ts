import { NextResponse } from 'next/server'

export interface InflacionData {
  mesActual: { fecha: string; valor: number }
  mesAnterior: { fecha: string; valor: number }
  acumuladoAnio: number
  ultimos12Meses: number
}

export async function GET() {
  try {
    const [mensualRes, interanualRes] = await Promise.all([
      fetch('https://api.argentinadatos.com/v1/finanzas/indices/inflacion', { next: { revalidate: 3600 } }),
      fetch('https://api.argentinadatos.com/v1/finanzas/indices/inflacionInteranual', { next: { revalidate: 3600 } }),
    ])

    if (!mensualRes.ok || !interanualRes.ok) return NextResponse.json(null, { status: 502 })

    const mensual: { fecha: string; valor: number }[] = await mensualRes.json()
    const interanual: { fecha: string; valor: number }[] = await interanualRes.json()

    const mesActual   = mensual[mensual.length - 1]
    const mesAnterior = mensual[mensual.length - 2]

    // Acumulado año actual: producto compuesto de los meses del año en curso
    const anioActual = new Date().getFullYear()
    const mesesAnio  = mensual.filter(m => m.fecha.startsWith(String(anioActual)))
    const acumuladoAnio = mesesAnio.length
      ? +(mesesAnio.reduce((acc, m) => acc * (1 + m.valor / 100), 1) * 100 - 100).toFixed(1)
      : 0

    const ultimos12Meses = interanual[interanual.length - 1].valor

    return NextResponse.json({ mesActual, mesAnterior, acumuladoAnio, ultimos12Meses } satisfies InflacionData)
  } catch {
    return NextResponse.json(null, { status: 500 })
  }
}
