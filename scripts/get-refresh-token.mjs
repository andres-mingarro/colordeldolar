import { google } from 'googleapis'
import http from 'http'
import { createInterface } from 'readline'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '..', '.env.local') })

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || 'TU_CLIENT_ID'
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'TU_CLIENT_SECRET'
const REDIRECT_URI = 'http://localhost:4567'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive.file'],
})

console.log('\n=== Abrí esta URL en el navegador ===\n')
console.log(authUrl)
console.log('\n=====================================\n')
console.log('Esperando autorización en http://localhost:4567 ...\n')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI)
  const code = url.searchParams.get('code')

  if (!code) {
    res.end('Error: no se recibió código')
    return
  }

  res.end('<h1>Listo! Podés cerrar esta ventana y volver a la terminal.</h1>')
  server.close()

  const { tokens } = await oauth2Client.getToken(code)
  console.log('\n=== REFRESH TOKEN ===')
  console.log(tokens.refresh_token)
  console.log('====================\n')
  console.log('Agregá esto a tu .env.local:')
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${CLIENT_ID}`)
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${CLIENT_SECRET}`)
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`)
})

server.listen(4567)
