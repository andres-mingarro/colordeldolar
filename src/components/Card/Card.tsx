import { CSSProperties, ReactNode } from 'react'

type Gap = 'default' | 'big' | 'small'

const gapClass: Record<Gap, string> = {
  small:   'gap-2',
  default: 'gap-6',
  big:     'gap-10',
}

interface Props {
  children: ReactNode
  gap?: Gap
  className?: string
  style?: CSSProperties
}

export default function Card({ children, gap = 'default', className = '', style }: Props) {
  return (
    <div
      className={`rounded-xl border ${gapClass[gap]} ${className}`}
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface)', ...style }}
    >
      {children}
    </div>
  )
}
