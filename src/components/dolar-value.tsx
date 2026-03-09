import styles from './dolar-value.module.scss'

type ColorVariant = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'neutral'

interface DolarValueProps {
  titulo: string
  compra: number
  venta: number
  color?: ColorVariant
}

export default function DolarValue({ titulo, compra, venta, color = 'neutral' }: DolarValueProps) {
  return (
    <div className={`${styles.card} ${styles[`variant-${color}`]}`}>
      <span className={styles.label}>{titulo}</span>

      <div className={styles.values}>
        <div className={styles.valueGroup}>
          <span className={styles.valueLabel}>Compra</span>
          <span className={styles.compra}>${compra.toLocaleString('es-AR')}</span>
        </div>
        <div className={styles.valueGroup}>
          <span className={styles.valueLabel}>Venta</span>
          <span className={styles.venta}>${venta.toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  )
}
