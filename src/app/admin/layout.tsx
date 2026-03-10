import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin · Color del Dólar',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
