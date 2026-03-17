import Logo from '@/components/Logo/Logo'
import SocialIcons from '@/components/SocialIcons/SocialIcons'
import styles from './Footer.module.scss'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.logoWrap}>
          <Logo />
        </span>
        <div className={styles.meta}>
          <span>© 2026 Color del Dólar</span>
          <span className={styles.sep}>·</span>
          <a href="/terminos" className={styles.tyc}>Términos y condiciones</a>
        </div>
      </div>
      <SocialIcons />
    </footer>
  )
}
