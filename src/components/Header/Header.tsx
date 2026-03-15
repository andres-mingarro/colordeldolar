import Link from 'next/link'
import Logo from '@/components/Logo/Logo'
import SocialIcons from '@/components/SocialIcons/SocialIcons'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import styles from './Header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoWrap}>
        <Link href="/" aria-label="Ir al inicio">
          <Logo />
        </Link>
      </div>
      <div className={styles.right}>
        <SocialIcons />
        <span className={styles.divider} />
        <ThemeToggle />
      </div>
    </header>
  )
}
