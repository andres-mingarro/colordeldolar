import { google } from 'googleapis'
import { Readable } from 'stream'

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
}

export async function subirImagenDrive(buffer: Buffer, nombre: string): Promise<string> {
  const auth = getAuth()
  const drive = google.drive({ version: 'v3', auth })
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!

  // Si ya existe un archivo con ese nombre en la carpeta, lo sobreescribe
  const existing = await drive.files.list({
    q: `name='${nombre}' and '${folderId}' in parents and trashed=false`,
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
