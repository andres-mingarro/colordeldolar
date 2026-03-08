type ColorVariant = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'neutral'

const colorStyles: Record<ColorVariant, { bg: string; border: string; label: string; compra: string; venta: string }> = {
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    label: 'text-green-400',
    compra: 'text-green-400',
    venta: 'text-green-300',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'text-blue-400',
    compra: 'text-blue-400',
    venta: 'text-blue-300',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'text-yellow-400',
    compra: 'text-yellow-400',
    venta: 'text-yellow-300',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'text-red-400',
    compra: 'text-red-400',
    venta: 'text-red-300',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    label: 'text-purple-400',
    compra: 'text-purple-400',
    venta: 'text-purple-300',
  },
  neutral: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    label: 'text-zinc-400',
    compra: 'text-white',
    venta: 'text-zinc-200',
  },
}

interface DolarValueProps {
  titulo: string
  compra: number
  venta: number
  color?: ColorVariant
}

export default function DolarValue({ titulo, compra, venta, color = 'neutral' }: DolarValueProps) {
  const styles = colorStyles[color]

  return (
    <div className={`flex flex-col items-center gap-4 rounded-2xl px-14 py-10 ${styles.bg} border ${styles.border}`}>
      <span className={`text-sm font-semibold uppercase tracking-widest ${styles.label}`}>
        {titulo}
      </span>

      <div className="flex gap-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Compra</span>
          <span className={`text-6xl font-bold tabular-nums ${styles.compra}`}>
            ${compra.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Venta</span>
          <span className={`text-6xl font-bold tabular-nums ${styles.venta}`}>
            ${venta.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </div>
  )
}
