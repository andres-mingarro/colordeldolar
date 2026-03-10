'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CotizacionDiaria } from '@/db/schema'
import styles from './page.module.scss'

interface Props {
  cotizaciones: CotizacionDiaria[]
  pollingActivo: boolean
  pollingIntervalo: number
  mercadoHoraApertura: string
  mercadoHoraCierre: string
  xPostApertura: boolean
  xMsgApertura: string
  xPostCierre: boolean
  xMsgCierre: string
}

function variacion(apertura: string, cierre: string) {
  const a = Number(apertura)
  const c = Number(cierre)
  if (a === c) return null
  const diff = c - a
  const pct = ((diff / a) * 100).toFixed(2)
  const signo = diff > 0 ? '+' : ''
  return { diff, label: `${signo}$${diff.toLocaleString('es-AR')} (${signo}${pct}%)`, positivo: diff > 0 }
}

export default function AdminDashboard({
  cotizaciones,
  pollingActivo,
  pollingIntervalo,
  mercadoHoraApertura,
  mercadoHoraCierre,
  xPostApertura,
  xMsgApertura,
  xPostCierre,
  xMsgCierre,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'configuracion' | 'x' | 'cotizaciones' | 'instagram'>('configuracion')

  const [activo, setActivo] = useState(pollingActivo)
  const [intervalo, setIntervalo] = useState(pollingIntervalo)
  const [horaApertura, setHoraApertura] = useState(mercadoHoraApertura)
  const [horaCierre, setHoraCierre] = useState(mercadoHoraCierre)
  const [guardandoPolling, setGuardandoPolling] = useState(false)
  const [guardadoPolling, setGuardadoPolling] = useState(false)

  const [xApertura, setXApertura] = useState(xPostApertura)
  const [msgApertura, setMsgApertura] = useState(xMsgApertura)
  const [xCierre, setXCierre] = useState(xPostCierre)
  const [msgCierre, setMsgCierre] = useState(xMsgCierre)
  const [guardandoX, setGuardandoX] = useState(false)
  const [guardadoX, setGuardadoX] = useState(false)

  const [generandoImagen, setGenerandoImagen] = useState(false)
  const [imagenGenerada, setImagenGenerada] = useState<{ nombre: string; preview: string } | null>(null)
  const [errorImagen, setErrorImagen] = useState(false)

  async function generarImagen() {
    setGenerandoImagen(true)
    setImagenGenerada(null)
    setErrorImagen(false)
    const res = await fetch('/api/admin/imagen', { method: 'POST' })
    setGenerandoImagen(false)
    if (res.ok) {
      const data = await res.json()
      setImagenGenerada({ nombre: data.nombre, preview: data.preview })
    } else {
      setErrorImagen(true)
    }
  }

  async function guardarPolling(e: { preventDefault(): void }) {
    e.preventDefault()
    setGuardandoPolling(true)
    setGuardadoPolling(false)
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polling_activo: activo, polling_intervalo: intervalo, mercado_hora_apertura: horaApertura, mercado_hora_cierre: horaCierre }),
    })
    setGuardandoPolling(false)
    setGuardadoPolling(true)
    setTimeout(() => setGuardadoPolling(false), 2000)
  }

  async function guardarX(e: { preventDefault(): void }) {
    e.preventDefault()
    setGuardandoX(true)
    setGuardadoX(false)
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x_post_apertura: xApertura,
        x_msg_apertura: msgApertura,
        x_post_cierre: xCierre,
        x_msg_cierre: msgCierre,
      }),
    })
    setGuardandoX(false)
    setGuardadoX(true)
    setTimeout(() => setGuardadoX(false), 2000)
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel Admin</h1>
        <div className={styles.headerActions}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.logoutBtn}>Home</a>
          <button onClick={logout} className={styles.logoutBtn}>Cerrar sesión</button>
        </div>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'configuracion' ? styles.tabActive : ''}`}
          onClick={() => setTab('configuracion')}
        >
          Configuración
        </button>
        <button
          className={`${styles.tab} ${tab === 'instagram' ? styles.tabActive : ''}`}
          onClick={() => setTab('instagram')}
        >
          Instagram
        </button>
        <button
          className={`${styles.tab} ${tab === 'x' ? styles.tabActive : ''}`}
          onClick={() => setTab('x')}
        >
          Opciones de X
        </button>
        <button
          className={`${styles.tab} ${tab === 'cotizaciones' ? styles.tabActive : ''}`}
          onClick={() => setTab('cotizaciones')}
        >
          Cotizaciones de hoy
        </button>
      </nav>

      {/* ── Configuración de actualización ── */}
      {tab === 'configuracion' && <section className={styles.card}>
        <h2 className={styles.cardTitle}>Configuración general</h2>
        <form onSubmit={guardarPolling} className={styles.configForm}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={activo}
              onChange={e => setActivo(e.target.checked)}
              className={styles.checkbox}
            />
            Activar actualización automática
          </label>

          <label className={styles.fieldLabel}>
            Intervalo (minutos)
            <input
              type="number"
              min={1}
              max={60}
              value={intervalo}
              disabled={!activo}
              onChange={e => setIntervalo(Number(e.target.value))}
              className={styles.numberInput}
            />
          </label>

          <div className={styles.subGroup}>
            <p className={styles.subGroupTitle}>Mercado</p>
            <div className={styles.horasRow}>
              <label className={styles.fieldLabel}>
                Hora de apertura
                <input
                  type="time"
                  value={horaApertura}
                  onChange={e => setHoraApertura(e.target.value)}
                  className={styles.numberInput}
                />
              </label>
              <label className={styles.fieldLabel}>
                Hora de cierre
                <input
                  type="time"
                  value={horaCierre}
                  onChange={e => setHoraCierre(e.target.value)}
                  className={styles.numberInput}
                />
              </label>
            </div>
          </div>

          <button type="submit" disabled={guardandoPolling} className={styles.saveBtn}>
            {guardandoPolling ? 'Guardando…' : guardadoPolling ? '✓ Guardado' : 'Guardar'}
          </button>
        </form>

      </section>}

      {/* ── Opciones de X ── */}
      {tab === 'x' && <section className={styles.card}>
        <h2 className={styles.cardTitle}>Opciones de X</h2>
        <p className={styles.xHint}>
          Variables disponibles: <code>[blueCompra]</code> <code>[blueVenta]</code>{' '}
          <code>[oficialCompra]</code> <code>[oficialVenta]</code> <code>[time]</code> <code>[fecha]</code>
        </p>
        <form onSubmit={guardarX} className={styles.xForm}>
          <div className={styles.xBlock}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={xApertura}
                onChange={e => setXApertura(e.target.checked)}
                className={styles.checkbox}
              />
              Post de apertura
            </label>
            <textarea
              value={msgApertura}
              onChange={e => setMsgApertura(e.target.value)}
              disabled={!xApertura}
              rows={10}
              className={styles.textarea}
            />
          </div>

          <div className={styles.xBlock}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={xCierre}
                onChange={e => setXCierre(e.target.checked)}
                className={styles.checkbox}
              />
              Post de cierre
            </label>
            <textarea
              value={msgCierre}
              onChange={e => setMsgCierre(e.target.value)}
              disabled={!xCierre}
              rows={10}
              className={styles.textarea}
            />
          </div>

          <button type="submit" disabled={guardandoX} className={styles.saveBtn}>
            {guardandoX ? 'Guardando…' : guardadoX ? '✓ Guardado' : 'Guardar'}
          </button>
        </form>
      </section>}

      {/* ── Instagram ── */}
      {tab === 'instagram' && <section className={styles.card}>
        <h2 className={styles.cardTitle}>Imagen para Instagram</h2>
        <div className={styles.imagenSection}>
          <button
            onClick={generarImagen}
            disabled={generandoImagen}
            className={styles.imagenBtn}
          >
            {generandoImagen ? 'Generando…' : 'Generar y subir imagen a Drive'}
          </button>
          {imagenGenerada && (
            <div>
              <p className={styles.imagenOk}>✓ Imagen subida: {imagenGenerada.nombre}</p>
              <img
                src={`data:image/png;base64,${imagenGenerada.preview}`}
                alt="Preview"
                className={styles.imagenPreview}
              />
            </div>
          )}
          {errorImagen && (
            <p className={styles.imagenError}>Error al generar la imagen.</p>
          )}
        </div>
      </section>}

      {/* ── Cotizaciones de hoy ── */}
      {tab === 'cotizaciones' && <section className={styles.card}>
        <h2 className={styles.cardTitle}>Cotizaciones de hoy</h2>
        <p className={styles.xHint}>Valores de apertura y cierre registrados hoy para el dólar Blue y Oficial. La variación compara el precio de venta al cierre vs. la apertura.</p>
        {cotizaciones.length === 0 ? (
          <p className={styles.emptyMsg}>Sin datos por hoy.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Apertura compra</th>
                  <th>Apertura venta</th>
                  <th>Cierre compra</th>
                  <th>Cierre venta</th>
                  <th>Variación venta</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map(c => {
                  const v = variacion(c.aperturaVenta, c.cierreVenta)
                  return (
                    <tr key={c.tipo}>
                      <td className={styles.tipoBadge}>{c.tipo}</td>
                      <td>${Number(c.aperturaCompra).toLocaleString('es-AR')}</td>
                      <td>${Number(c.aperturaVenta).toLocaleString('es-AR')}</td>
                      <td>${Number(c.cierreCompra).toLocaleString('es-AR')}</td>
                      <td>${Number(c.cierreVenta).toLocaleString('es-AR')}</td>
                      <td className={v ? (v.positivo ? styles.varPos : styles.varNeg) : styles.varNeutral}>
                        {v ? v.label : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>}
    </div>
  )
}
