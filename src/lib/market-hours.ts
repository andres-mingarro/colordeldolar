// ⚙️ Cambiar a true para forzar polling cada 1 minuto (útil en desarrollo)
export const FORCE_POLLING = false

const TIMEZONE = 'America/Argentina/Buenos_Aires'
const HORA_APERTURA = 9   // 9:00 AM
const HORA_CIERRE = 18    // 6:00 PM

function ahoraEnArgentina(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

export function esMercadoAbierto(): boolean {
  if (FORCE_POLLING) return true

  const ahora = ahoraEnArgentina()
  const dia = ahora.getDay()   // 0=Dom, 1=Lun ... 6=Sab
  const hora = ahora.getHours()

  const esFinDeSemana = dia === 0 || dia === 6
  const esHorarioOperativo = hora >= HORA_APERTURA && hora < HORA_CIERRE

  return !esFinDeSemana && esHorarioOperativo
}

export function msHastaProximaApertura(): number {
  const ahora = ahoraEnArgentina()
  const dia = ahora.getDay()
  const hora = ahora.getHours()

  const proxima = new Date(ahora)
  proxima.setSeconds(0)
  proxima.setMilliseconds(0)
  proxima.setHours(HORA_APERTURA, 0, 0, 0)

  if (dia === 6) {
    // Sábado → lunes
    proxima.setDate(proxima.getDate() + 2)
  } else if (dia === 0) {
    // Domingo → lunes
    proxima.setDate(proxima.getDate() + 1)
  } else if (hora >= HORA_CIERRE) {
    // Después del cierre → siguiente día hábil
    const diasHastaSiguiente = dia === 5 ? 3 : 1 // Viernes → lunes
    proxima.setDate(proxima.getDate() + diasHastaSiguiente)
  }
  // Si es antes de apertura el mismo día hábil, proxima ya está bien

  return proxima.getTime() - ahora.getTime()
}
