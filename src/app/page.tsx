'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DolarValue from '@/components/dolar-value'
import { esMercadoAbierto, msHastaProximaApertura, FORCE_POLLING } from '@/lib/market-hours'
import styles from './page.module.scss'

interface DolarData {
  compra: number
  venta: number
}

interface DolarResponse {
  blue: DolarData
  oficial: DolarData
}

export default function Home() {
  const [data, setData] = useState<DolarResponse | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('')
  const [mercadoAbierto, setMercadoAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [pollingActivo, setPollingActivo] = useState(true)
  const [pollingIntervaloMs, setPollingIntervaloMs] = useState(60_000)
  const [configCargada, setConfigCargada] = useState(false)

  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const iniciarPollingRef = useRef<(() => void) | undefined>(undefined)

  const fetchDolar = useCallback(async () => {
    try {
      const res = await fetch('/api/dolar')
      const json = await res.json()
      setData(json)
      setUltimaActualizacion(new Date().toLocaleTimeString('es-AR'))
    } catch (e) {
      console.error('Error al obtener el dólar', e)
    } finally {
      setCargando(false)
    }
  }, [])

  const limpiarTimers = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const iniciarPolling = useCallback(() => {
    limpiarTimers()
    if (!pollingActivo && !FORCE_POLLING) return

    const abierto = esMercadoAbierto()
    setMercadoAbierto(abierto)

    if (abierto || FORCE_POLLING) {
      intervaloRef.current = setInterval(() => {
        fetchDolar()
        if (!esMercadoAbierto() && !FORCE_POLLING) iniciarPollingRef.current?.()
      }, pollingIntervaloMs)
    } else {
      timeoutRef.current = setTimeout(() => {
        fetchDolar()
        iniciarPollingRef.current?.()
      }, msHastaProximaApertura())
    }
  }, [fetchDolar, limpiarTimers, pollingActivo, pollingIntervaloMs])

  useEffect(() => {
    iniciarPollingRef.current = iniciarPolling
  })

  useEffect(() => {
    fetchDolar()
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        setPollingActivo(cfg.polling_activo)
        setPollingIntervaloMs(cfg.polling_intervalo * 60_000)
      })
      .catch(() => {})
      .finally(() => setConfigCargada(true))
  }, [fetchDolar])

  useEffect(() => {
    if (!configCargada) return
    iniciarPolling()
    return limpiarTimers
  }, [configCargada, iniciarPolling, limpiarTimers])

  const dotActive = FORCE_POLLING || (pollingActivo && mercadoAbierto)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>💵 Color del Dólar</h1>

      {cargando ? (
        <p className={styles.loading}>Cargando valores...</p>
      ) : data ? (
        <div className={styles.cardsWrapper}>
          <DolarValue
            titulo="Dólar Blue"
            compra={data.blue.compra}
            venta={data.blue.venta}
            color="green"
          />
          <DolarValue
            titulo="Dólar Oficial"
            compra={data.oficial.compra}
            venta={data.oficial.venta}
            color="neutral"
          />
        </div>
      ) : (
        <p className={styles.error}>Error al cargar los valores.</p>
      )}

      <div className={styles.status}>
        <div className={styles.statusRow}>
          <span className={`${styles.statusDot} ${dotActive ? styles.statusDotActive : ''}`} />
          <span className={styles.statusText}>
            {FORCE_POLLING
              ? 'Polling forzado 24/7 (desarrollo)'
              : !pollingActivo
              ? 'Polling desactivado'
              : mercadoAbierto
              ? `Mercado abierto · actualizando cada ${pollingIntervaloMs / 60_000} min`
              : 'Mercado cerrado · sin actualización automática'}
          </span>
        </div>
        {ultimaActualizacion && (
          <p className={styles.lastUpdate}>Última actualización: {ultimaActualizacion}</p>
        )}
      </div>
    </div>
  )
}
