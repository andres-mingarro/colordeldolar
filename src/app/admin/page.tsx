import { db } from '@/db'
import { cotizacionesDiarias, configuracion } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { fechaHoyAR } from '@/lib/fecha'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const hoy = fechaHoyAR()

  const [cotizacionesHoy, configRows] = await Promise.all([
    db.select().from(cotizacionesDiarias).where(eq(cotizacionesDiarias.fecha, hoy)),
    db.select().from(configuracion),
  ])

  const cfg = Object.fromEntries(configRows.map(r => [r.clave, r.valor]))

  return (
    <AdminDashboard
      cotizaciones={cotizacionesHoy}
      pollingActivo={cfg.polling_activo !== 'false'}
      pollingIntervalo={Number(cfg.polling_intervalo ?? '1')}
    />
  )
}
