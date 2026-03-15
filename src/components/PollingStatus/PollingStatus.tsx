import { cn } from '@/lib/utils'

interface Props {
  dotActive: boolean
  pollingActivo: boolean
  mercadoAbierto: boolean
  pollingIntervaloMs: number
  ultimaActualizacion: string
  forcePoll: boolean
}

export default function PollingStatus({ dotActive, pollingActivo, mercadoAbierto, pollingIntervaloMs, ultimaActualizacion, forcePoll }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span
          className={cn('size-2 rounded-full', dotActive && 'animate-pulse')}
          style={{ background: dotActive ? 'var(--dot-active)' : 'var(--dot-inactive)' }}
        />
        <span className="text-xs text-muted-foreground">
          {forcePoll
            ? 'Actualización forzada 24/7 (desarrollo)'
            : !pollingActivo
            ? 'Actualización desactivada'
            : mercadoAbierto
            ? `Mercado abierto · actualizando cada ${pollingIntervaloMs / 60_000} min`
            : 'Mercado cerrado · sin actualización automática'}
        </span>
      </div>
      {ultimaActualizacion && (
        <p className="text-xs" style={{ color: 'var(--dimmer)' }}>
          Última actualización: {ultimaActualizacion}
        </p>
      )}
    </div>
  )
}
