/** Fecha de hoy en zona horaria de Argentina (UTC-3, sin DST) → "YYYY-MM-DD" */
export function fechaHoyAR(): string {
  const now = new Date()
  const ar = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  return ar.toISOString().split('T')[0]
}
