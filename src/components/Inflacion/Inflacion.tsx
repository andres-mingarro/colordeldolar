import Trend from '@/components/Trend/Trend'
import Container from '@/components/Container/Container'
import Card from '@/components/Card/Card'
import type { InflacionData } from '@/app/api/inflacion/route'

interface Props {
  data: InflacionData
}

export default function Inflacion({ data }: Props) {
  const { mesActual, mesAnterior, acumuladoAnio, ultimos12Meses } = data

  const tendencia = mesActual.valor > mesAnterior.valor ? 'up' : mesActual.valor < mesAnterior.valor ? 'down' : null

  const mes = new Date(mesActual.fecha + 'T12:00:00').toLocaleString('es-AR', { month: 'long' })
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1)
  const anio = new Date(mesActual.fecha + 'T12:00:00').getFullYear()

  return (
    <Container tag="div" size="medium" className="inflacion" classNameInner=" ">
      <Card padding="small" className="flex gap-4 flex-col lg:flex-row items-center justify-center w-full">
        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>
          Inflación {anio}:
        </span>
        <div className="content-date flex flex-col lg:flex-row items-center gap-4 mt-2 lg:mt-0 w-full lg:w-auto">
          <Stat label={mesCapitalizado} valor={mesActual.valor} trend={<Trend valor={tendencia} />} />
          <Divider />
          <Stat label="Acumulado año" valor={acumuladoAnio} />
          <Divider />
          <Stat label="Últimos 12 meses" valor={ultimos12Meses} />
        </div>
      </Card>
    </Container>
  )
}

function Stat({ label, valor, trend }: { label: string; valor: number; trend?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: 'var(--fg-secondary)' }}>
      <span style={{ color: 'var(--muted)' }}>{label}:</span>
      <span className="font-semibold">
        {valor.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
      </span>
      {trend}
    </span>
  )
}

function Divider() {
  return <span className="block h-px w-full lg:h-4 lg:w-px lg:self-center" style={{ background: 'var(--border-subtle)' }} />
}
