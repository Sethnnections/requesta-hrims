'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/store/slices/auth-slice'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      console.log('ProtectedLayout: Checking authentication...')
      
      // Check authentication
      const authenticated = isAuthenticated()
      console.log('ProtectedLayout: Authenticated:', authenticated)
      
      if (!authenticated) {
        console.log('ProtectedLayout: Not authenticated, redirecting to login')
        // Add a small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/login')
      } else {
        setIsChecking(false)
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-requesta-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}