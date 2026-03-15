import Trend from '@/components/Trend/Trend'

type ColorVariant = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'neutral'

interface DolarValueProps {
  titulo: string
  compra: number
  venta: number
  color?: ColorVariant
  tendencia?: 'up' | 'down' | null
  dummyUp?: boolean
  dummyDown?: boolean
}

export default function DolarValue({ titulo, compra, venta, color = 'neutral', tendencia, dummyUp, dummyDown }: DolarValueProps) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-2xl py-7 px-10 border"
      style={{
        background: `var(--v-${color}-bg)`,
        borderColor: `var(--v-${color}-border)`,
      }}
    >
      <span
        className="flex items-center gap-1.5 text-base font-semibold uppercase tracking-widest"
        style={{ color: `var(--v-${color}-label)` }}
      >
        {titulo}
        <Trend valor={tendencia ?? null} dummyUp={dummyUp} dummyDown={dummyDown} />
      </span>

      <div className="flex gap-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Compra</span>
          <span
            className="text-4xl font-bold tabular-nums leading-none"
            style={{ color: `var(--v-${color}-compra)` }}
          >
            ${compra.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Venta</span>
          <span
            className="text-4xl font-bold tabular-nums leading-none"
            style={{ color: `var(--v-${color}-venta)` }}
          >
            ${venta.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </div>
  )
}
