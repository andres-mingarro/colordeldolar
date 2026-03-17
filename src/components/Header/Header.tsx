import Logo from '@/components/Logo/Logo'
import SocialIcons from '@/components/SocialIcons/SocialIcons'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import TransitionLink from '@/components/TransitionLink/TransitionLink'
import styles from './Header.module.scss'

export default function Header() {
  return (
    <header className={`mb-9 ${styles.header}`}>
      <div className={styles.logoWrap}>
        <TransitionLink href="/" aria-label="Ir al inicio">
          <Logo />
        </TransitionLink>
      </div>
      <div className={styles.right}>
        <SocialIcons />
        <span className={styles.divider} />
        <ThemeToggle />
      </div>
    </header>
  )
}
