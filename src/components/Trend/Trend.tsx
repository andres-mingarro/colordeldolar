type TrendValue = 'up' | 'down' | null

interface Props {
  valor: TrendValue
  dummyUp?: boolean
  dummyDown?: boolean
}

export default function Trend({ valor, dummyUp, dummyDown }: Props) {
  const effective: TrendValue = dummyUp ? 'up' : dummyDown ? 'down' : valor
  if (!effective) return null
  return (
    <span style={{ color: effective === 'up' ? 'var(--v-green-label)' : 'var(--error)' }}>
      {effective === 'up' ? '↑' : '↓'}
    </span>
  )
}
