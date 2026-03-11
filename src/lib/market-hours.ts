// ⚙️ Cambiar a true para forzar polling cada 1 minuto (útil en desarrollo)
export const FORCE_POLLING = false

export const TIMEZONE = 'America/Argentina/Buenos_Aires'

function ahoraEnArgentina(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

function parseHora(horaStr: string): { hora: number; minutos: number } {
  const [h, m] = horaStr.split(':').map(Number)
  return { hora: h ?? 9, minutos: m ?? 0 }
}

function minutosDelDia(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function esMercadoAbierto(horaApertura = '09:00', horaCierre = '18:00'): boolean {
  if (FORCE_POLLING) return true

  const ahora = ahoraEnArgentina()
  const dia = ahora.getDay()
  const esFinDeSemana = dia === 0 || dia === 6
  if (esFinDeSemana) return false

  const minActual = minutosDelDia(ahora)
  const { hora: hA, minutos: mA } = parseHora(horaApertura)
  const { hora: hC, minutos: mC } = parseHora(horaCierre)

  return minActual >= hA * 60 + mA && minActual < hC * 60 + mC
}

export function esDespuesCierre(horaCierre = '18:00'): boolean {
  const ahora = ahoraEnArgentina()
  const dia = ahora.getDay()
  if (dia === 0 || dia === 6) return false

  const { hora: hC, minutos: mC } = parseHora(horaCierre)
  return minutosDelDia(ahora) >= hC * 60 + mC
}

export function msHastaProximaApertura(horaApertura = '09:00', horaCierre = '18:00'): number {
  const ahora = ahoraEnArgentina()
  const dia = ahora.getDay()

  const { hora: hA, minutos: mA } = parseHora(horaApertura)
  const { hora: hC, minutos: mC } = parseHora(horaCierre)

  const proxima = new Date(ahora)
  proxima.setHours(hA, mA, 0, 0)

  const minActual = minutosDelDia(ahora)
  const minCierre = hC * 60 + mC

  if (dia === 6) {
    proxima.setDate(proxima.getDate() + 2)
  } else if (dia === 0) {
    proxima.setDate(proxima.getDate() + 1)
  } else if (minActual >= minCierre) {
    const diasHastaSiguiente = dia === 5 ? 3 : 1
    proxima.setDate(proxima.getDate() + diasHastaSiguiente)
  }

  return proxima.getTime() - ahora.getTime()
}
