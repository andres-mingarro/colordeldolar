import { db } from '@/db'
import { cotizacionesDiarias, configuracion, dolarSnapshot } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { fechaHoyAR } from '@/lib/fecha'
import AdminDashboard from './AdminDashboard'

const DEFAULT_MSG_APERTURA = `🟢 Apertura del mercado

💵 Blue      $[blueCompra] / $[blueVenta]
🏦 Oficial   $[oficialCompra] / $[oficialVenta]
📈 MEP       $[bolsaCompra] / $[bolsaVenta]
💳 Tarjeta   $[tarjetaVenta]
🔄 CCL       $[cclVenta]
🏭 Mayorista $[mayoristaVenta]

#DólarBlue #DólarOficial #MEP #CCL #Argentina
https://colordeldolar.com.ar`

const DEFAULT_MSG_CIERRE = `🔴 Cierre del mercado

💵 Blue      $[blueCompra] / $[blueVenta]
🏦 Oficial   $[oficialCompra] / $[oficialVenta]
📈 MEP       $[bolsaCompra] / $[bolsaVenta]
💳 Tarjeta   $[tarjetaVenta]
🔄 CCL       $[cclVenta]
🏭 Mayorista $[mayoristaVenta]

#DólarBlue #DólarOficial #MEP #CCL #Argentina
https://colordeldolar.com.ar`

export default async function AdminPage() {
  const hoy = fechaHoyAR()

  const [cotizacionesHoy, configRows, snapshotRows] = await Promise.all([
    db.select().from(cotizacionesDiarias).where(eq(cotizacionesDiarias.fecha, hoy)),
    db.select().from(configuracion),
    db.select().from(dolarSnapshot).limit(1),
  ])
  const snapshot = snapshotRows[0] ?? null

  const cfg = Object.fromEntries(configRows.map(r => [r.clave, r.valor]))

  return (
    <AdminDashboard
      cotizaciones={cotizacionesHoy}
      snapshot={snapshot}
      pollingActivo={cfg.polling_activo !== 'false'}
      pollingIntervalo={Math.max(1, parseInt(cfg.polling_intervalo ?? '1', 10) || 1)}
      mercadoHoraApertura={cfg.mercado_hora_apertura ?? '10:00'}
      mercadoHoraCierre={cfg.mercado_hora_cierre ?? '18:00'}
      xPostApertura={cfg.x_post_apertura === 'true'}
      xMsgApertura={cfg.x_msg_apertura ?? DEFAULT_MSG_APERTURA}
      xPostCierre={cfg.x_post_cierre === 'true'}
      xMsgCierre={cfg.x_msg_cierre ?? DEFAULT_MSG_CIERRE}
      xUltimoTweetId={cfg.x_ultimo_tweet_id ?? ''}
      xAperturaPosteadaHoy={cfg.x_apertura_posted === hoy}
      xCierrePosteadoHoy={cfg.x_cierre_posted === hoy}
      imagenAperturaGeneradaHoy={cfg.imagen_ultima_generacion === hoy}
      imagenCierreGeneradaHoy={cfg.imagen_cierre_ultima_generacion === hoy}
      driveFolderUrl={`https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_FOLDER_ID}`}
    />
  )
}
