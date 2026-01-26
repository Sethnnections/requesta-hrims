import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  username: string
  email: string
  role: string
  employeeId: string
  permissions: string[]
  profile?: any
  avatar?: string  
  department?: string
}


interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clearAuth: () => set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
)