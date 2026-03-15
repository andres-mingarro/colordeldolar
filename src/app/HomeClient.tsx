'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DolarValue from '@/components/DolarValue/dolar-value'
import Inflacion from '@/components/Inflacion/Inflacion'
import PollingStatus from '@/components/PollingStatus/PollingStatus'
import Container from '@/components/Container/Container'
import type { InflacionData } from '@/app/api/inflacion/route'
import { esMercadoAbierto, msHastaProximaApertura, FORCE_POLLING } from '@/lib/market-hours'

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
  inflacion: InflacionData | null
}

export default function HomeClient({ initialData, inflacion }: Props) {
  const [data, setData] = useState<DolarResponse | null>(initialData)
  const prevDataRef = useRef<DolarResponse | null>(null)
  const [tendencia, setTendencia] = useState<{ blue: 'up' | 'down' | null; oficial: 'up' | 'down' | null }>({ blue: null, oficial: null })
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
      const json: DolarResponse = await res.json()
      setTendencia(prev => {
        const p = prevDataRef.current
        if (!p) return prev
        return {
          blue:    json.blue.venta !== p.blue.venta       ? (json.blue.venta > p.blue.venta ? 'up' : 'down')         : prev.blue,
          oficial: json.oficial.venta !== p.oficial.venta ? (json.oficial.venta > p.oficial.venta ? 'up' : 'down')   : prev.oficial,
        }
      })
      prevDataRef.current = json
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
    <>
      {cargando ? (
        <p className="text-lg text-muted-foreground animate-pulse">Cargando valores...</p>
      ) : data ? (
        <Container tag="div" size="medium" classNameInner="flex flex-col sm:flex-row items-center gap-6">
          <DolarValue
            titulo="Dólar Blue"
            compra={data.blue.compra}
            venta={data.blue.venta}
            color="green"
            tendencia={tendencia.blue}
          />
          <DolarValue
            titulo="Dólar Oficial"
            compra={data.oficial.compra}
            venta={data.oficial.venta}
            color="neutral"
            tendencia={tendencia.oficial}
          />
        </Container>
      ) : (
        <p className="text-destructive">Error al cargar los valores.</p>
      )}

      {inflacion && <Inflacion data={inflacion} />}

      <PollingStatus
        dotActive={dotActive}
        pollingActivo={pollingActivo}
        mercadoAbierto={mercadoAbierto}
        pollingIntervaloMs={pollingIntervaloMs}
        ultimaActualizacion={ultimaActualizacion}
        forcePoll={FORCE_POLLING}
      />
    </>
  )
}
