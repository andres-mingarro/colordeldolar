import { TwitterApi } from 'twitter-api-v2'
import { and, desc, eq, lt } from 'drizzle-orm'
import { db } from '@/db'
import { cotizacionesDiarias } from '@/db/schema'

const FLECHA_ARRIBA = '↑'
const FLECHA_ABAJO = '↓'
const FLECHA_IGUAL = '→'

function calcularFlecha(cierre: number, apertura: number): string {
  if (cierre > apertura) return FLECHA_ARRIBA
  if (cierre < apertura) return FLECHA_ABAJO
  return FLECHA_IGUAL
}

async function ultimaCotizacion(tipo: 'blue' | 'oficial', fechaHoy: string) {
  const rows = await db
    .select()
    .from(cotizacionesDiarias)
    .where(and(eq(cotizacionesDiarias.tipo, tipo), lt(cotizacionesDiarias.fecha, fechaHoy)))
    .orderBy(desc(cotizacionesDiarias.fecha))
    .limit(1)
  return rows[0] ?? null
}

export async function obtenerVariablesAyer(fechaHoy: string) {
  const [blueAyer, oficialAyer] = await Promise.all([
    ultimaCotizacion('blue', fechaHoy),
    ultimaCotizacion('oficial', fechaHoy),
  ])
  return {
    blueAyerCompra: blueAyer ? blueAyer.cierreCompra : '',
    blueAyerVenta:  blueAyer ? blueAyer.cierreVenta  : '',
    blueFlecha:     blueAyer ? calcularFlecha(Number(blueAyer.cierreVenta), Number(blueAyer.aperturaVenta)) : '',
    oficialAyerCompra: oficialAyer ? oficialAyer.cierreCompra : '',
    oficialAyerVenta:  oficialAyer ? oficialAyer.cierreVenta  : '',
    oficialFlecha:     oficialAyer ? calcularFlecha(Number(oficialAyer.cierreVenta), Number(oficialAyer.aperturaVenta)) : '',
  }
}

export function buildTweetText(
  template: string,
  vars: {
    blueCompra: number | string
    blueVenta: number | string
    oficialCompra: number | string
    oficialVenta: number | string
    bolsaCompra: number | string
    bolsaVenta: number | string
    tarjetaCompra: number | string
    tarjetaVenta: number | string
    cclCompra: number | string
    cclVenta: number | string
    mayoristaCompra: number | string
    mayoristaVenta: number | string
    time: string
    fecha: string
    blueAyerCompra?: number | string
    blueAyerVenta?: number | string
    blueFlecha?: string
    oficialAyerCompra?: number | string
    oficialAyerVenta?: number | string
    oficialFlecha?: string
  }
): string {
  return template
    .replace(/\[blueCompra\]/g, String(vars.blueCompra))
    .replace(/\[blueVenta\]/g, String(vars.blueVenta))
    .replace(/\[oficialCompra\]/g, String(vars.oficialCompra))
    .replace(/\[oficialVenta\]/g, String(vars.oficialVenta))
    .replace(/\[bolsaCompra\]/g, String(vars.bolsaCompra))
    .replace(/\[bolsaVenta\]/g, String(vars.bolsaVenta))
    .replace(/\[tarjetaCompra\]/g, String(vars.tarjetaCompra))
    .replace(/\[tarjetaVenta\]/g, String(vars.tarjetaVenta))
    .replace(/\[cclCompra\]/g, String(vars.cclCompra))
    .replace(/\[cclVenta\]/g, String(vars.cclVenta))
    .replace(/\[mayoristaCompra\]/g, String(vars.mayoristaCompra))
    .replace(/\[mayoristaVenta\]/g, String(vars.mayoristaVenta))
    .replace(/\[blueAyerCompra\]/g, String(vars.blueAyerCompra ?? ''))
    .replace(/\[blueAyerVenta\]/g, String(vars.blueAyerVenta ?? ''))
    .replace(/\[blueFlecha\]/g, vars.blueFlecha ?? '')
    .replace(/\[oficialAyerCompra\]/g, String(vars.oficialAyerCompra ?? ''))
    .replace(/\[oficialAyerVenta\]/g, String(vars.oficialAyerVenta ?? ''))
    .replace(/\[oficialFlecha\]/g, vars.oficialFlecha ?? '')
    .replace(/\[time\]/g, vars.time)
    .replace(/\[fecha\]/g, vars.fecha)
}

export async function postTweet(text: string): Promise<string> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  })
  const { data } = await client.v2.tweet(text)
  return data.id
}
