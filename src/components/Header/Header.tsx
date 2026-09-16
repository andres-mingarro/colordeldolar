'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo/Logo'
import SocialIcons from '@/components/SocialIcons/SocialIcons'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import DesignToggle, { leerHomeDesign, type HomeDesign } from '@/components/DesignToggle/DesignToggle'
import TransitionLink from '@/components/TransitionLink/TransitionLink'
import styles from './Header.module.scss'

export default function Header() {
  const pathname = usePathname()
  const [design, setDesign] = useState<HomeDesign>('nuevo')

  useEffect(() => {
    // Se lee recién después de hidratar: el SSR siempre asume 'nuevo'.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDesign(leerHomeDesign())
    const onDesignChange = () => setDesign(leerHomeDesign())
    window.addEventListener('home-design-change', onDesignChange)
    return () => window.removeEventListener('home-design-change', onDesignChange)
  }, [])

  const enHome = pathname === '/'
  const transparente = enHome && design === 'nuevo'

  return (
    <header className={`${transparente ? '' : 'mb-9'} ${styles.header} ${transparente ? styles.transparent : ''}`}>
      <div className={styles.logoWrap}>
        <TransitionLink href="/" aria-label="Ir al inicio">
          <Logo />
        </TransitionLink>
      </div>
      <div className={styles.right}>
        <span className={styles.socialsWrap}>
          <SocialIcons />
          <span className={styles.divider} />
        </span>
        {enHome && (
          <>
            <DesignToggle />
            <span className={styles.divider} />
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
