'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/slices/auth-slice'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setTokens } = useAuthStore()

  const login = async (identifier: string, password: string) => {
    setIsLoading(true)
    try {
      // Use your actual API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Invalid credentials')
      }

      const data = await response.json()
      
      // Store tokens and user data
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      
      // Store in localStorage for persistence
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return data
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    useAuthStore.getState().clearAuth()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  return {
    login,
    logout,
    isLoading,
  }
}