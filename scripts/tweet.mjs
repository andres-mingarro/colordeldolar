import { TwitterApi } from 'twitter-api-v2'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

dotenv.config({ path: resolve(ROOT, '.env.local') })

// 🔇 Cambiar a true para deshabilitar el envío de tweets
const TWEETS_DESACTIVADOS = true

const APERTURA_FILE = resolve(ROOT, 'data', 'apertura.json')

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

const SITE_URL = 'https://colordeldolar.com.ar'

async function fetchDolar() {
  const [blueRes, oficialRes, bolsaRes, tarjetaRes, cclRes, mayoristaRes] = await Promise.all([
    fetch('https://dolarapi.com/v1/dolares/blue'),
    fetch('https://dolarapi.com/v1/dolares/oficial'),
    fetch('https://dolarapi.com/v1/dolares/bolsa'),
    fetch('https://dolarapi.com/v1/dolares/tarjeta'),
    fetch('https://dolarapi.com/v1/dolares/contadoconliqui'),
    fetch('https://dolarapi.com/v1/dolares/mayorista'),
  ])
  const blue = await blueRes.json()
  const oficial = await oficialRes.json()
  const bolsa = await bolsaRes.json()
  const tarjeta = await tarjetaRes.json()
  const ccl = await cclRes.json()
  const mayorista = await mayoristaRes.json()
  return { blue, oficial, bolsa, tarjeta, ccl, mayorista }
}

function formatPrecio(valor) {
  return `$${Number(valor).toLocaleString('es-AR')}`
}

function signo(n) {
  return n > 0 ? `+${formatPrecio(n)}` : formatPrecio(n)
}

async function tweetApertura() {
  const { blue, oficial, bolsa, tarjeta, ccl, mayorista } = await fetchDolar()

  // Guardar valores de apertura para calcular diferencia al cierre
  writeFileSync(APERTURA_FILE, JSON.stringify({
    fecha: new Date().toISOString(),
    blue: { compra: blue.compra, venta: blue.venta },
    oficial: { compra: oficial.compra, venta: oficial.venta },
  }))

  const texto = `🟢 Apertura del mercado

💵 Blue      ${formatPrecio(blue.compra)} / ${formatPrecio(blue.venta)}
🏦 Oficial   ${formatPrecio(oficial.compra)} / ${formatPrecio(oficial.venta)}
📈 MEP       ${formatPrecio(bolsa.compra)} / ${formatPrecio(bolsa.venta)}
💳 Tarjeta   ${formatPrecio(tarjeta.venta)}
🔄 CCL       ${formatPrecio(ccl.venta)}
🏭 Mayorista ${formatPrecio(mayorista.venta)}

#DólarBlue #DólarOficial #MEP #CCL #Argentina
${SITE_URL}`

  if (TWEETS_DESACTIVADOS) {
    console.log('Tweets desactivados. Texto que se hubiera enviado:\n', texto)
    return
  }
  await client.v2.tweet(texto)
  console.log('Tweet de apertura enviado ✓')
}

async function tweetCierre() {
  const { blue, oficial, bolsa, tarjeta, ccl, mayorista } = await fetchDolar()

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

💵 Blue      ${formatPrecio(blue.compra)} / ${formatPrecio(blue.venta)}${diffBlue}
🏦 Oficial   ${formatPrecio(oficial.compra)} / ${formatPrecio(oficial.venta)}${diffOficial}
📈 MEP       ${formatPrecio(bolsa.compra)} / ${formatPrecio(bolsa.venta)}
💳 Tarjeta   ${formatPrecio(tarjeta.venta)}
🔄 CCL       ${formatPrecio(ccl.venta)}
🏭 Mayorista ${formatPrecio(mayorista.venta)}

#DólarBlue #DólarOficial #MEP #CCL #Argentina
${SITE_URL}`

  if (TWEETS_DESACTIVADOS) {
    console.log('Tweets desactivados. Texto que se hubiera enviado:\n', texto)
    return
  }
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
