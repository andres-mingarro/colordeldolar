'use client'

import { useRouter } from 'next/navigation'
import type { AnchorHTMLAttributes } from 'react'

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

export default function TransitionLink({ href, children, onClick, ...props }: Props) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    onClick?.(e)
    if (!document.startViewTransition) {
      router.push(href)
      return
    }
    document.startViewTransition(() => {
      router.push(href)
    })
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
