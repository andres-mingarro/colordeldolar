import { TwitterApi } from 'twitter-api-v2'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

dotenv.config({ path: resolve(ROOT, '.env.local') })
const APERTURA_FILE = resolve(ROOT, 'data', 'apertura.json')

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

async function fetchDolar() {
  const [blueRes, oficialRes] = await Promise.all([
    fetch('https://dolarapi.com/v1/dolares/blue'),
    fetch('https://dolarapi.com/v1/dolares/oficial'),
  ])
  const blue = await blueRes.json()
  const oficial = await oficialRes.json()
  return { blue, oficial }
}

function formatPrecio(valor) {
  return `$${Number(valor).toLocaleString('es-AR')}`
}

function signo(n) {
  return n > 0 ? `+${formatPrecio(n)}` : formatPrecio(n)
}

async function tweetApertura() {
  const { blue, oficial } = await fetchDolar()

  // Guardar valores de apertura para calcular diferencia al cierre
  writeFileSync(APERTURA_FILE, JSON.stringify({
    fecha: new Date().toISOString(),
    blue: { compra: blue.compra, venta: blue.venta },
    oficial: { compra: oficial.compra, venta: oficial.venta },
  }))

  const texto = `🟢 Apertura del mercado

💵 Dólar Blue
   Compra: ${formatPrecio(blue.compra)}
   Venta:  ${formatPrecio(blue.venta)}

🏦 Dólar Oficial
   Compra: ${formatPrecio(oficial.compra)}
   Venta:  ${formatPrecio(oficial.venta)}

⏰ ${new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })} | colordeldolar.vercel.app`

  await client.v2.tweet(texto)
  console.log('Tweet de apertura enviado ✓')
}

async function tweetCierre() {
  const { blue, oficial } = await fetchDolar()

  let diffBlueVenta = null
  let diffOficialVenta = null

  if (existsSync(APERTURA_FILE)) {
    const apertura = JSON.parse(readFileSync(APERTURA_FILE, 'utf8'))
    diffBlueVenta = blue.venta - apertura.blue.venta
    diffOficialVenta = oficial.venta - apertura.oficial.venta
  }

  const diffBlue = diffBlueVenta !== null ? ` (${signo(diffBlueVenta)})` : ''
  const diffOficial = diffOficialVenta !== null ? ` (${signo(diffOficialVenta)})` : ''

  const texto = `🔴 Cierre del mercado

💵 Dólar Blue
   Compra: ${formatPrecio(blue.compra)}
   Venta:  ${formatPrecio(blue.venta)}${diffBlue}

🏦 Dólar Oficial
   Compra: ${formatPrecio(oficial.compra)}
   Venta:  ${formatPrecio(oficial.venta)}${diffOficial}

⏰ ${new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })} | colordeldolar.vercel.app`

  await client.v2.tweet(texto)
  console.log('Tweet de cierre enviado ✓')
}

const modo = process.argv[2]
if (modo === 'apertura') {
  tweetApertura().catch(console.error)
} else if (modo === 'cierre') {
  tweetCierre().catch(console.error)
} else {
  console.error('Uso: node scripts/tweet.mjs apertura|cierre')
  process.exit(1)
}
