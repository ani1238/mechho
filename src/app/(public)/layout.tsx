import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import PageViewTracker from '@/components/analytics/PageViewTracker'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageViewTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
