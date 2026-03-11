import { db } from '@/db'
import { cotizacionesDiarias, configuracion } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { fechaHoyAR } from '@/lib/fecha'
import AdminDashboard from './AdminDashboard'

const DEFAULT_MSG_APERTURA = `Apertura del mercado

💵 Dólar Blue
   Compra: $[blueCompra]
   Venta:  $[blueVenta]

🏦 Dólar Oficial
   Compra: $[oficialCompra]
   Venta:  $[oficialVenta]

⏰ [time]`

const DEFAULT_MSG_CIERRE = `Cierre del mercado

💵 Dólar Blue
   Compra: $[blueCompra]
   Venta:  $[blueVenta]

🏦 Dólar Oficial
   Compra: $[oficialCompra]
   Venta:  $[oficialVenta]

⏰ [time]`

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
      pollingIntervalo={Math.max(1, parseInt(cfg.polling_intervalo ?? '1', 10) || 1)}
      mercadoHoraApertura={cfg.mercado_hora_apertura ?? '10:00'}
      mercadoHoraCierre={cfg.mercado_hora_cierre ?? '18:00'}
      xPostApertura={cfg.x_post_apertura === 'true'}
      xMsgApertura={cfg.x_msg_apertura ?? DEFAULT_MSG_APERTURA}
      xPostCierre={cfg.x_post_cierre === 'true'}
      xMsgCierre={cfg.x_msg_cierre ?? DEFAULT_MSG_CIERRE}
      driveFolderUrl={`https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_FOLDER_ID}`}
    />
  )
}
