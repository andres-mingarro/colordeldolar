import { CSSProperties, ElementType, ReactNode, Ref } from 'react'
import styles from './Container.module.scss'

type Size = 'default' | 'medium' | 'small' | 'full'
type MarginBottom = 'none' | 'small' | 'default'

interface Props {
  children: ReactNode
  size?: Size
  tag?: ElementType
  id?: string
  className?: string
  classNameInner?: string
  style?: CSSProperties
  nopadding?: boolean
  elementRef?: Ref<HTMLDivElement>
  mb?: MarginBottom
}

const sizeClass: Record<Size, string> = {
  default: 'container',
  medium:  'container-medium',
  small:   'container-small',
  full:    'container-full',
}

export default function Container({
  children,
  size = 'default',
  tag: Tag = 'section',
  id,
  className = '',
  classNameInner = '',
  style,
  nopadding,
  elementRef,
  mb = 'default',
}: Props) {
  const mbClass: Record<MarginBottom, string> = { none: 'mb-0', small: 'mb-4', default: 'mb-9' }
  return (
    <Tag id={id} className={`${styles[sizeClass[size]]} ${className} ${mbClass[mb]}`} style={style}>
      <div
        ref={elementRef}
        className={`${styles['container-inner']} ${nopadding ? styles['no-padding'] : ''} ${classNameInner}`}
      >
        {children}
      </div>
    </Tag>
  )
}
