import { google } from 'googleapis'
import { Readable } from 'stream'

function getAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  )
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  })
  return oauth2Client
}

export async function subirImagenDrive(buffer: Buffer, nombre: string): Promise<string> {
  const auth = getAuth()
  const drive = google.drive({ version: 'v3', auth })
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!

  // Si ya existe un archivo con ese nombre en la carpeta, lo sobreescribe
  const safeName = nombre.replace(/'/g, "\\'")
  const safeFolderId = folderId.replace(/'/g, "\\'")
  const existing = await drive.files.list({
    q: `name='${safeName}' and '${safeFolderId}' in parents and trashed=false`,
    fields: 'files(id)',
  })

  if (existing.data.files && existing.data.files.length > 0) {
    const fileId = existing.data.files[0].id!
    await drive.files.update({
      fileId,
      media: { mimeType: 'image/png', body: Readable.from(buffer) },
    })
    return fileId
  }

  const res = await drive.files.create({
    requestBody: { name: nombre, parents: [folderId] },
    media: { mimeType: 'image/png', body: Readable.from(buffer) },
    fields: 'id',
  })
  return res.data.id!
}
