import HomeClient from './HomeClient'
import type { InflacionData } from './api/inflacion/route'

async function getInflacion(): Promise<InflacionData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/inflacion`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getInitialDolar() {
  try {
    const [blueRes, oficialRes] = await Promise.all([
      fetch('https://dolarapi.com/v1/dolares/blue', { next: { revalidate: 60 } }),
      fetch('https://dolarapi.com/v1/dolares/oficial', { next: { revalidate: 60 } }),
    ])
    if (!blueRes.ok || !oficialRes.ok) return null
    const [blue, oficial] = await Promise.all([blueRes.json(), oficialRes.json()])
    return { blue, oficial }
  } catch {
    return null
  }
}

export default async function Home() {
  const [initialData, inflacion] = await Promise.all([getInitialDolar(), getInflacion()])

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialData={initialData} inflacion={inflacion} />
    </>
  )
}
