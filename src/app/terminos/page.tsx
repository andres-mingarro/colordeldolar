import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones — Color del Dólar',
  description: 'Términos y condiciones de uso del sitio Color del Dólar.',
  robots: { index: false, follow: false },
}

export default function TerminosPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16">

        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--fg)' }}>
          Términos y condiciones
        </h1>
        <p className="text-xs mb-10" style={{ color: 'var(--dimmer)' }}>
          Última actualización: marzo de 2026
        </p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>1. Información general</h2>
            <p>
              Color del Dólar (<strong>colordeldolar.com.ar</strong>) es un servicio de consulta informativa
              que muestra cotizaciones del dólar blue y dólar oficial en Argentina. Las cotizaciones
              se obtienen de fuentes públicas de terceros y se actualizan de forma periódica durante
              el horario de mercado.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>2. Naturaleza informativa</h2>
            <p>
              Toda la información publicada en este sitio tiene <strong>carácter exclusivamente informativo</strong>.
              Los valores mostrados no constituyen asesoramiento financiero, económico ni de inversión,
              y no deben interpretarse como una oferta o recomendación para realizar operaciones cambiarias
              de ningún tipo.
            </p>
            <p className="mt-3">
              Color del Dólar no es una entidad financiera, no opera en el mercado de cambios y no está
              regulado por el Banco Central de la República Argentina (BCRA) ni por ningún otro organismo
              de contralor.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>3. Exactitud de los datos</h2>
            <p>
              Si bien nos esforzamos por mostrar datos actualizados y precisos, no garantizamos la
              exactitud, completitud ni disponibilidad de la información en todo momento. Las cotizaciones
              pueden presentar diferencias con las del mercado real debido a demoras en la actualización,
              interrupciones del servicio o variaciones propias del mercado informal.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>4. Limitación de responsabilidad</h2>
            <p>
              El uso de este sitio es bajo exclusiva responsabilidad del usuario. Color del Dólar no
              se responsabiliza por pérdidas, daños directos o indirectos, o perjuicios de cualquier
              naturaleza que pudieran derivarse del uso o la imposibilidad de uso de la información
              aquí publicada.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>5. Propiedad intelectual</h2>
            <p>
              El diseño, logotipo, nombre y contenidos originales de Color del Dólar son propiedad de
              sus creadores. Queda prohibida su reproducción total o parcial sin autorización expresa.
              Los datos de cotización provienen de fuentes de terceros y son de dominio público.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>6. Privacidad y cookies</h2>
            <p>
              Este sitio puede utilizar herramientas de analítica web (como Google Analytics) para
              medir el tráfico de manera anónima y agregada. No recopilamos datos personales
              identificables ni los compartimos con terceros con fines comerciales.
            </p>
            <p className="mt-3">
              El sitio guarda únicamente la preferencia de tema (claro/oscuro) en el almacenamiento
              local del navegador del usuario.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
              entrarán en vigencia a partir de su publicación en esta página. El uso continuado del
              sitio implica la aceptación de los términos vigentes.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg-secondary)' }}>8. Contacto</h2>
            <p>
              Para consultas sobre estos términos podés escribirnos a través de{' '}
              <a
                href="https://x.com/colordeldolar"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--fg-secondary)' }}
                className="underline underline-offset-2"
              >
                @colordeldolar en X
              </a>.
            </p>
          </section>

        </div>
    </div>
  )
}
