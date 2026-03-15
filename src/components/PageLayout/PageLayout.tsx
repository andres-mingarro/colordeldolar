import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </>
  )
}
