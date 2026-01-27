// components/auth/protected-route.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth/use-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  redirectTo = '/unauthorized' 
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, canAccess, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (requiredPermissions.length > 0 && !canAccess(requiredPermissions)) {
        router.push(redirectTo)
      }
    }
  }, [user, isLoading, requiredPermissions, canAccess, router, redirectTo])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-requesta-primary"></div>
      </div>
    )
  }
  
  if (!user || (requiredPermissions.length > 0 && !canAccess(requiredPermissions))) {
    return null
  }
  
  return <>{children}</>
}