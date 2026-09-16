'use client'

import { useEffect, useState } from 'react'
import styles from './DesignToggle.module.scss'

export type HomeDesign = 'clasico' | 'nuevo'

export function leerHomeDesign(): HomeDesign {
  if (typeof document === 'undefined') return 'nuevo'
  return document.documentElement.getAttribute('data-home-design') === 'clasico' ? 'clasico' : 'nuevo'
}

export default function DesignToggle() {
  const [design, setDesign] = useState<HomeDesign>(() => leerHomeDesign())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Marca que ya estamos en el cliente (post-hidratación) para evitar mismatch SSR/CSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  function elegir(next: HomeDesign) {
    if (next === design) return
    document.documentElement.setAttribute('data-home-design', next)
    localStorage.setItem('home_design', next)
    window.dispatchEvent(new Event('home-design-change'))
    setDesign(next)
  }

  if (!mounted) return <div className={styles.placeholder} />

  return (
    <div className={styles.toggle} role="group" aria-label="Diseño de la home">
      <button
        type="button"
        className={`${styles.btn} ${design === 'clasico' ? styles.active : ''}`}
        onClick={() => elegir('clasico')}
        aria-pressed={design === 'clasico'}
        aria-label="Diseño clásico"
        title="Diseño clásico"
      >
        <GridIcon />
      </button>
      <button
        type="button"
        className={`${styles.btn} ${design === 'nuevo' ? styles.active : ''}`}
        onClick={() => elegir('nuevo')}
        aria-pressed={design === 'nuevo'}
        aria-label="Diseño nuevo"
        title="Diseño nuevo"
      >
        <SplitIcon />
      </button>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function SplitIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 L20 12 L12 22 Z" opacity="0.55" />
      <path d="M12 2 L4 12 L12 22 Z" />
    </svg>
  )
}
