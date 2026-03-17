import { CSSProperties, ReactNode } from 'react'

type Padding = 'default' | 'big' | 'small' | 'none'

const paddingClass: Record<Padding, string> = {
  none:    '',
  small:   'px-3 py-2',
  default: 'px-5 py-3',
  big:     'px-10 py-7',
}

interface Props {
  children: ReactNode
  padding?: Padding
  className?: string
  style?: CSSProperties
}

export default function Card({ children, padding = 'default', className = '', style }: Props) {
  return (
    <div
      className={`rounded-xl border ${paddingClass[padding]} ${className}`}
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface)', ...style }}
    >
      {children}
    </div>
  )
}
