import styles from './SplitHero.module.scss'

type Tendencia = 'up' | 'down' | null

interface Props {
  blueCompra: number
  blueVenta: number
  oficialCompra: number
  oficialVenta: number
  blueTendencia: Tendencia
  oficialTendencia: Tendencia
}

export default function SplitHero({ blueCompra, blueVenta, oficialCompra, oficialVenta, blueTendencia, oficialTendencia }: Props) {
  return (
    <div className={styles.stage}>
      <div className={styles.panelGreen} />
      <div className={styles.panelBlue} />

      <div className={`${styles.band} ${styles.bandBlue}`}>
        <span className={styles.label}>
          Dólar Blue
          <TendenciaGlifo valor={blueTendencia} />
        </span>
        <span className={styles.num}>${blueVenta.toLocaleString('es-AR')}</span>
        <div className={styles.sub}>
          <span className={styles.pill}>compra ${blueCompra.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className={`${styles.band} ${styles.bandOficial}`}>
        <span className={styles.label}>
          Dólar Oficial
          <TendenciaGlifo valor={oficialTendencia} />
        </span>
        <span className={styles.num}>${oficialVenta.toLocaleString('es-AR')}</span>
        <div className={styles.sub}>
          <span className={styles.pill}>compra ${oficialCompra.toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  )
}

function TendenciaGlifo({ valor }: { valor: Tendencia }) {
  if (!valor) return null
  return <span className={styles.trend}>{valor === 'up' ? '↑' : '↓'}</span>
}
