import HomeClient from './HomeClient'
import { fetchInflacionData } from './api/inflacion/route'
import { db } from '@/db'
import { dolarSnapshot } from '@/db/schema'
import { eq } from 'drizzle-orm'

async function getInitialDolar() {
  try {
    const [blueRes, oficialRes, mepRes, tarjetaRes, cclRes, mayoristaRes] = await Promise.all([
      fetch('https://dolarapi.com/v1/dolares/blue', { next: { revalidate: 60 } }),
      fetch('https://dolarapi.com/v1/dolares/oficial', { next: { revalidate: 60 } }),
      fetch('https://dolarapi.com/v1/dolares/bolsa', { next: { revalidate: 60 } }),
      fetch('https://dolarapi.com/v1/dolares/tarjeta', { next: { revalidate: 60 } }),
      fetch('https://dolarapi.com/v1/dolares/contadoconliqui', { next: { revalidate: 60 } }),
      fetch('https://dolarapi.com/v1/dolares/mayorista', { next: { revalidate: 60 } }),
    ])
    if (!blueRes.ok || !oficialRes.ok) return null
    const [blue, oficial, mep, tarjeta, ccl, mayorista] = await Promise.all([
      blueRes.json(), oficialRes.json(),
      mepRes.ok ? mepRes.json() : Promise.resolve(null),
      tarjetaRes.ok ? tarjetaRes.json() : Promise.resolve(null),
      cclRes.ok ? cclRes.json() : Promise.resolve(null),
      mayoristaRes.ok ? mayoristaRes.json() : Promise.resolve(null),
    ])
    return { blue, oficial, mep, tarjeta, ccl, mayorista }
  } catch {
    return null
  }
}

async function getSnapshot() {
  try {
    const rows = await db.select().from(dolarSnapshot).where(eq(dolarSnapshot.id, 1))
    return rows[0] ?? null
  } catch {
    return null
  }
}

export default async function Home() {
  const [initialData, inflacion, snapshot] = await Promise.all([getInitialDolar(), fetchInflacionData(), getSnapshot()])

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Colordeldolar',
    url: 'https://colordeldolar.com.ar',
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Color del Dólar',
    description: 'Cotización del dólar blue y oficial en Argentina en tiempo real',
    url: 'https://colordeldolar.com.ar',
    inLanguage: 'es-AR',
    ...(initialData && {
      mainEntity: [
        {
          '@type': 'ExchangeRateSpecification',
          name: 'Dólar Blue',
          currency: 'USD',
          currentExchangeRate: {
            '@type': 'UnitPriceSpecification',
            price: initialData.blue.venta,
            priceCurrency: 'ARS',
          },
        },
        {
          '@type': 'ExchangeRateSpecification',
          name: 'Dólar Oficial',
          currency: 'USD',
          currentExchangeRate: {
            '@type': 'UnitPriceSpecification',
            price: initialData.oficial.venta,
            priceCurrency: 'ARS',
          },
        },
      ],
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialData={initialData} inflacion={inflacion} snapshot={snapshot} />
    </>
  )
}
