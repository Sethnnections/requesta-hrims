import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { User } from '@/types/auth/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearUser: () => void
  hasPermission: (permission: string) => boolean
  initializeFromStorage: () => boolean
  checkAuth: () => boolean
}

// Create a type-safe partialize function
const partialize = (state: AuthState): Partial<AuthState> => ({
  user: state.user,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  isAuthenticated: state.isAuthenticated,
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setUser: (user: User) => {
        console.log('setUser called with:', user)
        set({ 
          user, 
          isAuthenticated: !!user 
        })
        
        // Also sync to localStorage immediately
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user))
        }
      },
      
      setTokens: (accessToken: string, refreshToken: string) => {
        console.log('setTokens called')
        set({ 
          accessToken, 
          refreshToken 
        })
        
        // Also sync to localStorage immediately
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          
          // Set cookies for middleware
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`
        }
      },
      
      clearUser: () => {
        console.log('clearUser called')
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false 
        })
        
        // Also clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          
          // Clear cookies
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      },
      
      hasPermission: (permission: string): boolean => {
        const { user } = get()
        return user?.permissions?.includes(permission) || false
      },
      
      initializeFromStorage: (): boolean => {
        console.log('initializeFromStorage called')
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          const storedUser = localStorage.getItem('user')
          const refreshToken = localStorage.getItem('refreshToken')
          
          console.log('Storage check:', {
            hasToken: !!token,
            hasUser: !!storedUser,
            hasRefreshToken: !!refreshToken
          })
          
          if (token && storedUser) {
            try {
              const user: User = JSON.parse(storedUser)
              console.log('Restoring user from storage:', user)
              set({ 
                user, 
                accessToken: token,
                refreshToken,
                isAuthenticated: true 
              })
              return true
            } catch (error) {
              console.error('Failed to parse stored user:', error)
            }
          }
        }
        return false
      },
      
      checkAuth: (): boolean => {
        const { isAuthenticated, accessToken, user } = get()
        
        // Check if we have all required auth data
        const hasAuthData = !!accessToken && !!user
        
        console.log('checkAuth:', {
          isAuthenticated,
          hasAuthData,
          hasAccessToken: !!accessToken,
          hasUser: !!user
        })
        
        // If state says authenticated but data is missing, fix it
        if (isAuthenticated && !hasAuthData) {
          console.log('State inconsistent, clearing auth')
          get().clearUser()
          return false
        }
        
        // If state says not authenticated but we have data, restore it
        if (!isAuthenticated && hasAuthData) {
          console.log('State says not authenticated but we have data, restoring')
          return get().initializeFromStorage()
        }
        
        return isAuthenticated && hasAuthData
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize,
    } as PersistOptions<AuthState, Partial<AuthState>>
  )
)

// Helper function to get auth state directly
export const getAuthState = (): AuthState => {
  return useAuthStore.getState()
}

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const state = getAuthState()
  
  // First check Zustand state
  if (state.isAuthenticated && state.user && state.accessToken) {
    return true
  }
  
  // If Zustand doesn't have it, check localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      // Try to restore to Zustand
      try {
        const parsedUser: User = JSON.parse(user)
        useAuthStore.setState({
          user: parsedUser,
          accessToken: token,
          refreshToken: localStorage.getItem('refreshToken') || null,
          isAuthenticated: true
        })
        return true
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
      }
    }
  }
  
  return false
}

// Helper function to check auth and redirect if needed
export const requireAuth = (): boolean => {
  const authenticated = isAuthenticated()
  
  if (!authenticated && typeof window !== 'undefined') {
    // Store the current URL for redirect after login
    const redirectPath = window.location.pathname + window.location.search
    if (redirectPath !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', redirectPath)
    }
    
    // Redirect to login
    window.location.href = '/login'
    return false
  }
  
  return authenticated
}

// Initialize auth from storage on module load
if (typeof window !== 'undefined') {
  // Small delay to ensure Zustand is ready
  setTimeout(() => {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    
    if (token && user && !useAuthStore.getState().isAuthenticated) {
      try {
        const parsedUser: User = JSON.parse(user)
        useAuthStore.setState({
          user: parsedUser,
          accessToken: token,
          refreshToken: localStorage.getItem('refreshToken') || null,
          isAuthenticated: true
        })
        console.log('Auth initialized from storage on page load')
      } catch (error) {
        console.error('Failed to initialize auth from storage:', error)
      }
    }
  }, 100)
}