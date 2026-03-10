'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import styles from './page.module.scss'

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [verPass, setVerPass] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  function renderWidget() {
    if (!turnstileRef.current || widgetIdRef.current) return
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      theme: 'dark',
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(null),
      'error-callback': () => setTurnstileToken(null),
    })
  }

  useEffect(() => {
    if (window.turnstile) renderWidget()
  }, [])

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    if (!turnstileToken) return
    setCargando(true)
    setError(false)

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
        turnstileToken,
      }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError(true)
      setCargando(false)
      setTurnstileToken(null)
      if (widgetIdRef.current) window.turnstile.reset(widgetIdRef.current)
    }
  }

  return (
    <div className={styles.container}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />

      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Panel Admin</h1>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Contraseña</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              name="password"
              type={verPass ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setVerPass(v => !v)}
              className={styles.eyeBtn}
              aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {verPass ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div ref={turnstileRef} className={styles.turnstile} />

        {error && <p className={styles.error}>Credenciales incorrectas.</p>}

        <button
          type="submit"
          disabled={cargando || !turnstileToken}
          className={styles.button}
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
