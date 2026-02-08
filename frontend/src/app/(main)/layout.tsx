'use client'

import { ProtectedLayout } from './_components/layout/protected-layout'
import { Sidebar } from './_components/sidebar/sidebar'
import { Header } from './_components/header/header'
import { Footer } from './_components/footer/footer'
import { Toaster } from '@/components//ui/toster'
import { useState, useEffect } from 'react'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate margin based on sidebar state and screen size
  const getMainMargin = () => {
    if (isMobile) return '0px' // No margin on mobile, sidebar is overlay
    return sidebarCollapsed ? '80px' : '288px' // w-20 = 80px, w-72 = 288px
  }

  return (
    <ProtectedLayout>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onToggle={setSidebarCollapsed} />
        {/* Main content area - dynamically adjusts based on sidebar state */}
        <div 
          className="flex-1 flex flex-col transition-all duration-300 min-w-0"
          style={{ 
            marginLeft: getMainMargin()
          }}
        >
          <Header />
          <main className="flex-1 w-full bg-gray-50">
            <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
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
