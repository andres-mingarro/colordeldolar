'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DolarValue from '@/components/DolarValue/dolar-value'
import Inflacion from '@/components/Inflacion/Inflacion'
import PollingStatus from '@/components/PollingStatus/PollingStatus'
import Container from '@/components/Container/Container'
import Card from '@/components/Card/Card'
import Trend from '@/components/Trend/Trend'
import type { InflacionData } from '@/app/api/inflacion/route'
import type { DolarSnapshot } from '@/db/schema'
import { esMercadoAbierto, msHastaProximaApertura, FORCE_POLLING } from '@/lib/market-hours'

interface DolarData {
  compra: number
  venta: number
}

interface DolarResponse {
  blue: DolarData
  oficial: DolarData
  mep: DolarData | null
  tarjeta: DolarData | null
  ccl: DolarData | null
  mayorista: DolarData | null
}

interface Props {
  initialData: DolarResponse | null
  inflacion: InflacionData | null
  snapshot: DolarSnapshot | null
}

export default function HomeClient({ initialData, inflacion, snapshot }: Props) {
  const [data, setData] = useState<DolarResponse | null>(initialData)
  const prevDataRef = useRef<DolarResponse | null>(initialData)

  function calcTendencia(curr: DolarResponse, prev: DolarResponse) {
    const t = (a: number, b: number) => a !== b ? (a > b ? 'up' : 'down') as 'up' | 'down' : null
    return {
      blue:      t(curr.blue.venta, prev.blue.venta),
      oficial:   t(curr.oficial.venta, prev.oficial.venta),
      mep:       curr.mep && prev.mep ? t(curr.mep.venta, prev.mep.venta) : null,
      tarjeta:   curr.tarjeta && prev.tarjeta ? t(curr.tarjeta.venta, prev.tarjeta.venta) : null,
      ccl:       curr.ccl && prev.ccl ? t(curr.ccl.venta, prev.ccl.venta) : null,
      mayorista: curr.mayorista && prev.mayorista ? t(curr.mayorista.venta, prev.mayorista.venta) : null,
    }
  }

  const [tendencia, setTendencia] = useState({
    blue:      (snapshot?.tendenciaBlue      as 'up' | 'down' | null) ?? null,
    oficial:   (snapshot?.tendenciaOficial   as 'up' | 'down' | null) ?? null,
    mep:       (snapshot?.tendenciaMep       as 'up' | 'down' | null) ?? null,
    tarjeta:   (snapshot?.tendenciaTarjeta   as 'up' | 'down' | null) ?? null,
    ccl:       (snapshot?.tendenciaCcl       as 'up' | 'down' | null) ?? null,
    mayorista: (snapshot?.tendenciaMayorista as 'up' | 'down' | null) ?? null,
  })
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
      const p = prevDataRef.current
      if (p) setTendencia(prev => ({ ...prev, ...calcTendencia(json, p) }))
      localStorage.setItem('dolar_prev', JSON.stringify(json))
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
        <Container tag="div" size="medium" className="row-value row-blue-oficial" classNameInner="flex flex-col lg:flex-row items-center gap-6 w-full">
          <DolarValue
            titulo="Dólar Blue"
            compra={data.blue.compra}
            venta={data.blue.venta}
            color="blue"
            tendencia={tendencia.blue}
          />
          <DolarValue
            titulo="Dólar Oficial"
            compra={data.oficial.compra}
            venta={data.oficial.venta}
            color="green"
            tendencia={tendencia.oficial}
          />
        </Container>
      ) : (
        <p className="text-destructive">Error al cargar los valores.</p>
      )}

      {data && (data.mep || data.tarjeta) && (
        <Container tag="div" size="medium" mb="small" className="row-value row-value-group row-mep-tarjeta" classNameInner="flex flex-col lg:flex-row gap-6 w-full">
          {data.mep && (
            <Card padding="small" className="dolar-mep flex flex-1 justify-center items-center gap-3">
              <MiniCotizacion label="Dólar MEP" compra={data.mep.compra} venta={data.mep.venta} tendencia={tendencia.mep} />
            </Card>
          )}
          {data.tarjeta && (
            <Card padding="small" className="dolar-tarjeta flex flex-1 justify-center items-center gap-3">
              <MiniCotizacion label="Dólar Tarjeta" compra={data.tarjeta.compra} venta={data.tarjeta.venta} tendencia={tendencia.tarjeta} />
            </Card>
          )}
        </Container>
      )}

      {data && (data.ccl || data.mayorista) && (
        <Container tag="div" size="medium" className="row-value row-value-group row-ccl-mayorista" classNameInner="flex flex-col lg:flex-row gap-6 w-full">
          {data.ccl && (
            <Card padding="small" className="dolar-ccl flex flex-1 justify-center items-center gap-3">
              <MiniCotizacion label="Dólar CCL" compra={data.ccl.compra} venta={data.ccl.venta} tendencia={tendencia.ccl} />
            </Card>
          )}
          {data.mayorista && (
            <Card padding="small" className="dolar-mayorista flex flex-1 justify-center items-center gap-3">
              <MiniCotizacion label="Dólar Mayorista" compra={data.mayorista.compra} venta={data.mayorista.venta} tendencia={tendencia.mayorista} />
            </Card>
          )}
        </Container>
      )}

      {inflacion && <hr className="border-none h-px w-full mb-9" style={{ background: 'var(--border-subtle)', maxWidth: '600px', margin: '0 auto 2.25rem' }} />}
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

function MiniCotizacion({ label, compra, venta, tendencia, className }: { label: string; compra: number; venta: number; tendencia: 'up' | 'down' | null; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1${className ? ` ${className}` : ''}`}>
      <span className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>
        {label}
        <Trend valor={tendencia} />
      </span>
      <div className="flex gap-3 items-center">
        <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: 'var(--fg-secondary)' }}>
          <span style={{ color: 'var(--muted)' }}>Compra:</span>
          <span className="font-semibold">${compra.toLocaleString('es-AR')}</span>
        </span>
        <span className="block h-3 w-px" style={{ background: 'var(--border-subtle)' }} />
        <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: 'var(--fg-secondary)' }}>
          <span style={{ color: 'var(--muted)' }}>Venta:</span>
          <span className="font-semibold">${venta.toLocaleString('es-AR')}</span>
        </span>
      </div>
    </div>
  )
}
