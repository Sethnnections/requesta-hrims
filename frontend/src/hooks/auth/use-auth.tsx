'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/slices/auth-slice'
import { PERMISSIONS, hasPermission, canAccessRoute, getUserRoleDisplay } from '@/lib/permissions'
import type { User } from '@/types/auth/user'

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user, setUser, setTokens, clearUser, hasPermission: storeHasPermission } = useAuthStore()

  // hooks/auth/use-auth.tsx - Update login function
const login = async (identifier: string, password: string) => {
  setIsLoading(true)
  try {
    console.log('Making login request to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`)
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })

    console.log('Login response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Login failed:', errorData)
      throw new Error(errorData.message || 'Invalid credentials')
    }

    const data = await response.json()
    console.log('Login success data:', data)
    
    // Store tokens and user data FIRST
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    
    // Force state update before redirect
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Also set cookies for middleware
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400`
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400`
    }
    
    return data
  } catch (error: any) {
    console.error('Login error:', error)
    throw new Error(error.message || 'Login failed. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

  const logout = useCallback(() => {
    clearUser()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    router.push('/login')
  }, [clearUser, router])

  // Permission checks
  const hasPerm = useCallback((permission: string) => {
    return storeHasPermission(permission)
  }, [storeHasPermission])

  const canAccess = useCallback((requiredPermissions: string[]) => {
    return canAccessRoute(user, requiredPermissions as any)
  }, [user])

// Role-based navigation items
const getNavigationItems = useCallback(() => {
  if (!user) return []
  
  const baseItems: Array<{ name: string; href: string; icon: string; badge?: string }> = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'My Profile', href: '/profile', icon: 'user' },
  ]
  
  // Employees
  if (hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL)) {
    baseItems.push({ name: 'Employees', href: '/employees/directory', icon: 'users' })
  }
  
  // Loans
  if (hasPerm(PERMISSIONS.LOANS_MANAGE) || hasPerm(PERMISSIONS.REQUESTS_CREATE)) {
    baseItems.push({ name: 'Loans', href: '/loans/applications', icon: 'banknote' })
  }
  
  // Travel
  if (hasPerm(PERMISSIONS.TRAVEL_MANAGE) || hasPerm(PERMISSIONS.REQUESTS_CREATE)) {
    baseItems.push({ name: 'Travel', href: '/travel/requests', icon: 'plane' })
  }
  
  // Overtime
  if (hasPerm(PERMISSIONS.OVERTIME_MANAGE) || hasPerm(PERMISSIONS.REQUESTS_CREATE)) {
    baseItems.push({ name: 'Overtime', href: '/overtime/claims', icon: 'clock' })
  }
  
  // Payroll
  if (hasPerm(PERMISSIONS.PAYROLL_MANAGE)) {
    baseItems.push({ name: 'Payroll', href: '/payroll/payslips', icon: 'dollar-sign' })
  }
  
  // Reports
  if (hasPerm(PERMISSIONS.REPORTS_VIEW)) {
    baseItems.push({ name: 'Reports', href: '/reports', icon: 'bar-chart' })
  }
  
  // Organization
  if (hasPerm(PERMISSIONS.DEPARTMENT_MANAGE)) {
    baseItems.push({ name: 'Organization', href: '/organization/structure', icon: 'building' })
  }
  
  // Approvals
  if (hasPerm(PERMISSIONS.APPROVALS_DEPARTMENT) || 
      hasPerm(PERMISSIONS.APPROVALS_TEAM) || 
      hasPerm(PERMISSIONS.APPROVALS_DIRECT_REPORTS)) {
    baseItems.push({ name: 'Approvals', href: '/workflows/approvals', icon: 'check-circle' })
  }
  
  // Admin
  if (hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) || 
      hasPerm(PERMISSIONS.USERS_MANAGE_ALL)) {
    baseItems.push({ name: 'Admin', href: '/admin/dashboard', icon: 'shield', badge: 'Admin' })
  }
  
  // Help & Support - Unique icon
  baseItems.push({ name: 'Help & Support', href: '/help-support', icon: 'help-circle' })
  
  return baseItems
}, [user, hasPerm])

  return {
    user,
    login,
    logout,
    hasPermission: hasPerm,
    canAccess,
    getNavigationItems,
    isLoading,
    isAuthenticated: !!user,
    getUserRoleDisplay: () => user ? getUserRoleDisplay(user.role) : '',
  }
}