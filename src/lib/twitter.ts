import { TwitterApi } from 'twitter-api-v2'

export function buildTweetText(
  template: string,
  vars: {
    blueCompra: number | string
    blueVenta: number | string
    oficialCompra: number | string
    oficialVenta: number | string
    time: string
    fecha: string
  }
): string {
  return template
    .replace(/\[blueCompra\]/g, String(vars.blueCompra))
    .replace(/\[blueVenta\]/g, String(vars.blueVenta))
    .replace(/\[oficialCompra\]/g, String(vars.oficialCompra))
    .replace(/\[oficialVenta\]/g, String(vars.oficialVenta))
    .replace(/\[time\]/g, vars.time)
    .replace(/\[fecha\]/g, vars.fecha)
}

export async function postTweet(text: string) {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  })
  await client.v2.tweet(text)
}
