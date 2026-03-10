'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.scss'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(false)

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
      }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError(true)
      setCargando(false)
    }
  }

  return (
    <div className={styles.container}>
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
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={styles.input}
          />
        </div>

        {error && <p className={styles.error}>Credenciales incorrectas.</p>}

        <button type="submit" disabled={cargando} className={styles.button}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
