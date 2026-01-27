
import { ProtectedLayout } from './_components/layout/protected-layout'
import { Sidebar } from './_components/sidebar/sidebar'
import { Header } from './_components/header/header'
import { Footer } from './_components/footer/footer'
import { Toaster } from '@/components//ui/toster'



export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ProtectedLayout>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <Header />
          <main className="min-h-[calc(100vh-160px)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <Toaster />
    </ProtectedLayout>
  )
}