'use client'

import TransitionLink from '@/components/TransitionLink/TransitionLink'

interface Props {
  href: string
  label?: string
}

export default function BackButton({ href, label = 'Volver' }: Props) {
  return (
    <TransitionLink
      href={href}
      className="inline-flex items-center gap-1.5 text-xs mb-8"
      style={{ color: 'var(--dimmer)' }}
    >
      ← {label}
    </TransitionLink>
  )
}
