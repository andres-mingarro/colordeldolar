import { TwitterApi } from 'twitter-api-v2'

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
