'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DolarValue from '@/components/DolarValue/dolar-value'
import { esMercadoAbierto, msHastaProximaApertura, FORCE_POLLING } from '@/lib/market-hours'
import { cn } from '@/lib/utils'

interface DolarData {
  compra: number
  venta: number
}

interface DolarResponse {
  blue: DolarData
  oficial: DolarData
}

interface Props {
  initialData: DolarResponse | null
}

export default function HomeClient({ initialData }: Props) {
  const [data, setData] = useState<DolarResponse | null>(initialData)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('')
  const [mercadoAbierto, setMercadoAbierto] = useState(false)
  const [cargando, setCargando] = useState(initialData === null)
  const [pollingActivo, setPollingActivo] = useState(true)
  const [pollingIntervaloMs, setPollingIntervaloMs] = useState(60_000)
  const [horaApertura, setHoraApertura] = useState('09:00')
  const [horaCierre, setHoraCierre] = useState('18:00')
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

    const abierto = esMercadoAbierto(horaApertura, horaCierre)
    setMercadoAbierto(abierto)

    if (abierto || FORCE_POLLING) {
      intervaloRef.current = setInterval(() => {
        fetchDolar()
        if (!esMercadoAbierto(horaApertura, horaCierre) && !FORCE_POLLING) iniciarPollingRef.current?.()
      }, pollingIntervaloMs)
    } else {
      timeoutRef.current = setTimeout(() => {
        fetchDolar()
        iniciarPollingRef.current?.()
      }, msHastaProximaApertura(horaApertura, horaCierre))
    }
  }, [fetchDolar, limpiarTimers, pollingActivo, pollingIntervaloMs, horaApertura, horaCierre])

  useEffect(() => {
    iniciarPollingRef.current = iniciarPolling
  })

  useEffect(() => {
    if (initialData) setUltimaActualizacion(new Date().toLocaleTimeString('es-AR'))
  }, [initialData])

  useEffect(() => {
    if (initialData === null) fetchDolar()
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        setPollingActivo(cfg.polling_activo)
        setPollingIntervaloMs(cfg.polling_intervalo * 60_000)
        if (cfg.mercado_hora_apertura) setHoraApertura(cfg.mercado_hora_apertura)
        if (cfg.mercado_hora_cierre) setHoraCierre(cfg.mercado_hora_cierre)
      })
      .catch(() => {})
      .finally(() => setConfigCargada(true))
  }, [fetchDolar, initialData])

  useEffect(() => {
    if (!configCargada) return
    iniciarPolling()
    return limpiarTimers
  }, [configCargada, iniciarPolling, limpiarTimers])

  const dotActive = FORCE_POLLING || (pollingActivo && mercadoAbierto)

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">

      {cargando ? (
        <p className="text-lg text-muted-foreground animate-pulse">Cargando valores...</p>
      ) : data ? (
        <div className="flex flex-col sm:flex-row items-center gap-6">
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
        <p className="text-destructive">Error al cargar los valores.</p>
      )}

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span
            className={cn('size-2 rounded-full', dotActive && 'animate-pulse')}
            style={{ background: dotActive ? 'var(--dot-active)' : 'var(--dot-inactive)' }}
          />
          <span className="text-xs text-muted-foreground">
            {FORCE_POLLING
              ? 'Actualización forzada 24/7 (desarrollo)'
              : !pollingActivo
              ? 'Actualización desactivada'
              : mercadoAbierto
              ? `Mercado abierto · actualizando cada ${pollingIntervaloMs / 60_000} min`
              : 'Mercado cerrado · sin actualización automática'}
          </span>
        </div>
        {ultimaActualizacion && (
          <p className="text-xs" style={{ color: 'var(--dimmer)' }}>
            Última actualización: {ultimaActualizacion}
          </p>
        )}
      </div>
    </div>
  )
}
