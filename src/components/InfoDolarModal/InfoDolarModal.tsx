'use client'

import { useEffect, useState } from 'react'
import styles from './InfoDolarModal.module.scss'

export default function InfoDolarModal() {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!abierto) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [abierto])

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={styles.trigger}>
        ¿Qué significan estas cotizaciones?
      </button>

      {/* Contenido siempre presente en el HTML (SEO), oculto visualmente hasta que se abre. */}
      <div
        className={`${styles.overlay} ${abierto ? styles.open : ''}`}
        onClick={() => setAbierto(false)}
        aria-hidden={!abierto}
      >
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-dolar-titulo"
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={() => setAbierto(false)} className={styles.close} aria-label="Cerrar">
            ×
          </button>

          <h2 id="info-dolar-titulo" className={styles.titulo}>
            ¿Qué significan estas cotizaciones del dólar?
          </h2>

          <div className={styles.contenido}>
            <p>
              <strong>Dólar blue:</strong> es la cotización del mercado informal argentino. No está regulada
              por el Banco Central y suele ser la referencia más usada para operaciones en efectivo entre
              particulares.
            </p>
            <p>
              <strong>Dólar oficial:</strong> es el tipo de cambio regulado por el Banco Central de la
              República Argentina (BCRA), el que fijan los bancos y casas de cambio autorizadas.
            </p>
            <p>
              <strong>Dólar MEP (bolsa):</strong> se obtiene comprando y vendiendo bonos en pesos y en dólares
              dentro del mercado local. Es una vía legal para dolarizar pesos sin límite de monto.
            </p>
            <p>
              <strong>Dólar CCL (contado con liquidación):</strong> es similar al MEP, pero la operación se
              liquida con la venta de los bonos en el exterior. Se usa para sacar dólares fuera del país.
            </p>
            <p>
              <strong>Dólar tarjeta:</strong> es el tipo de cambio que se aplica a las compras y consumos en
              el exterior pagados con tarjeta de crédito o débito, calculado sobre el dólar oficial más
              impuestos.
            </p>
            <p>
              <strong>Dólar mayorista:</strong> es la cotización interbancaria, la que se usa como referencia
              entre bancos y con el BCRA, y sirve de base para el resto de las cotizaciones oficiales.
            </p>
            <p className={styles.fuente}>
              Todos los valores se actualizan en tiempo real durante el horario del mercado a partir de{' '}
              <a href="https://dolarapi.com" target="_blank" rel="noopener noreferrer">
                dolarapi.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
