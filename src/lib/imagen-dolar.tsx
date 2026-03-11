import { ImageResponse } from 'next/og'

interface DolarData {
  compra: number
  venta: number
}

interface Params {
  blue: DolarData
  oficial: DolarData
  fecha: string
}

let fontsCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null

async function getFonts() {
  if (fontsCache) return fontsCache
  const [regular, bold] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5/files/inter-latin-400-normal.woff').then(r => r.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5/files/inter-latin-700-normal.woff').then(r => r.arrayBuffer()),
  ])
  fontsCache = { regular, bold }
  return fontsCache
}

export async function generarImagenDolar({ blue, oficial, fecha }: Params): Promise<Buffer> {
  const fonts = await getFonts()

  const response = new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'Inter',
          gap: '48px',
        }}
      >
        {/* Título */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: '#ffffff' }}>
            💵 Color del Dólar
          </div>
          <div style={{ fontSize: 28, color: '#71717a' }}>{fecha}</div>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', gap: '32px', width: '100%' }}>
          {/* Blue */}
          <div
            style={{
              flex: 1,
              background: 'rgba(74, 222, 128, 0.08)',
              border: '1px solid rgba(74, 222, 128, 0.25)',
              borderRadius: '24px',
              padding: '44px',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Dólar Blue
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: 18, color: '#71717a' }}>Compra</div>
                <div style={{ fontSize: 54, fontWeight: 700, color: '#ffffff' }}>
                  {`$${blue.compra.toLocaleString('es-AR')}`}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 18, color: '#71717a' }}>Venta</div>
                <div style={{ fontSize: 54, fontWeight: 700, color: '#4ade80' }}>
                  {`$${blue.venta.toLocaleString('es-AR')}`}
                </div>
              </div>
            </div>
          </div>

          {/* Oficial */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '44px',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Dólar Oficial
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: 18, color: '#71717a' }}>Compra</div>
                <div style={{ fontSize: 54, fontWeight: 700, color: '#ffffff' }}>
                  {`$${oficial.compra.toLocaleString('es-AR')}`}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 18, color: '#71717a' }}>Venta</div>
                <div style={{ fontSize: 54, fontWeight: 700, color: '#e4e4e7' }}>
                  {`$${oficial.venta.toLocaleString('es-AR')}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 26, color: '#3f3f46' }}>
          colordeldolar.com
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: 'Inter', data: fonts.regular, weight: 400 },
        { name: 'Inter', data: fonts.bold, weight: 700 },
      ],
    }
  )

  return Buffer.from(await response.arrayBuffer())
}
