'use client'

import { useEffect, useRef, useState } from 'react'
import DolarValue from '@/components/dolar-value'
import { esMercadoAbierto, msHastaProximaApertura, FORCE_POLLING } from '@/lib/market-hours'

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
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function fetchDolar() {
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
  }

  function limpiarTimers() {
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  function iniciarPolling() {
    limpiarTimers()
    const abierto = esMercadoAbierto()
    setMercadoAbierto(abierto)

    if (abierto) {
      // Mercado abierto → polling cada 1 minuto
      intervaloRef.current = setInterval(() => {
        fetchDolar()
        // Chequear si el mercado cerró
        if (!esMercadoAbierto()) iniciarPolling()
      }, 60_000)
    } else {
      // Mercado cerrado → esperar hasta la próxima apertura
      timeoutRef.current = setTimeout(() => {
        fetchDolar()
        iniciarPolling()
      }, msHastaProximaApertura())
    }
  }

  useEffect(() => {
    fetchDolar()
    iniciarPolling()
    return () => limpiarTimers()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 gap-10 px-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        💵 Color del Dólar
      </h1>

      {cargando ? (
        <p className="text-zinc-400 text-lg animate-pulse">Cargando valores...</p>
      ) : data ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
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
        <p className="text-red-400">Error al cargar los valores.</p>
      )}

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${FORCE_POLLING || mercadoAbierto ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs text-zinc-500">
            {FORCE_POLLING
              ? 'Polling forzado 24/7 (desarrollo)'
              : mercadoAbierto
              ? 'Mercado abierto · actualizando cada 1 minuto'
              : 'Mercado cerrado · sin actualización automática'}
          </span>
        </div>
        {ultimaActualizacion && (
          <p className="text-xs text-zinc-600">Última actualización: {ultimaActualizacion}</p>
        )}
      </div>
    </div>
  )
}
