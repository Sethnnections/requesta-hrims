import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { User, UserProfile } from '@/types/auth/user'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  
  // User methods
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  
  // Profile methods
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  clearProfile: () => void
  
  // Token methods
  setTokens: (accessToken: string, refreshToken: string) => void
  updateAccessToken: (accessToken: string) => void
  
  // Auth methods
  clearUser: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  initializeFromStorage: () => boolean
  checkAuth: () => boolean
  
  // Role and permission helpers
  getUserRoleInfo: () => {
    displayName: string
    role: string
    isAdmin: boolean
    isSuperAdmin: boolean
    isManager: boolean
    isSupervisor: boolean
    isHR: boolean
    isFinance: boolean
  } | null
  canAccessRoute: (requiredPermissions: string[]) => boolean
  canManageOrganization: () => boolean
  canViewOrganization: () => boolean
  hasOrganizationPermission: (action: 'create' | 'view' | 'edit' | 'delete', resource: 'department' | 'position' | 'grade') => boolean
}

// Create a type-safe partialize function
const partialize = (state: AuthState): Partial<AuthState> => ({
  user: state.user,
  profile: state.profile,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  isAuthenticated: state.isAuthenticated,
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      // User methods
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
      
      updateUser: (updates: Partial<User>) => {
        const { user } = get()
        if (!user) return
        
        const updatedUser = { ...user, ...updates }
        console.log('updateUser called with:', updates)
        set({ user: updatedUser })
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      },
      
      // Profile methods
      setProfile: (profile: UserProfile) => {
        console.log('setProfile called with:', profile)
        set({ profile })
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('profile', JSON.stringify(profile))
        }
      },
      
      updateProfile: (updates: Partial<UserProfile>) => {
        const { profile } = get()
        if (!profile) return
        
        const updatedProfile = { ...profile, ...updates }
        console.log('updateProfile called with:', updates)
        set({ profile: updatedProfile })
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('profile', JSON.stringify(updatedProfile))
        }
      },
      
      clearProfile: () => {
        console.log('clearProfile called')
        set({ profile: null })
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('profile')
        }
      },
      
      // Token methods
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
          const cookieOptions = 'path=/; max-age=86400; SameSite=Lax'
          document.cookie = `accessToken=${accessToken}; ${cookieOptions}`
          document.cookie = `refreshToken=${refreshToken}; ${cookieOptions}`
        }
      },
      
      updateAccessToken: (accessToken: string) => {
        console.log('updateAccessToken called')
        set({ accessToken })
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          const cookieOptions = 'path=/; max-age=86400; SameSite=Lax'
          document.cookie = `accessToken=${accessToken}; ${cookieOptions}`
        }
      },
      
      clearUser: () => {
        console.log('clearUser called')
        set({ 
          user: null, 
          profile: null,
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false 
        })
        
        // Also clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('profile')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          
          // Clear cookies
          const clearCookie = (name: string) => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
          clearCookie('accessToken')
          clearCookie('refreshToken')
          clearCookie('user')
        }
      },
      
      // Permission methods
      hasPermission: (permission: string): boolean => {
        const { user } = get()
        return user?.permissions?.includes(permission) || false
      },
      
      hasAnyPermission: (permissions: string[]): boolean => {
        const { user } = get()
        if (!user?.permissions) return false
        return permissions.some(permission => user.permissions.includes(permission))
      },
      
      hasAllPermissions: (permissions: string[]): boolean => {
        const { user } = get()
        if (!user?.permissions) return false
        return permissions.every(permission => user.permissions.includes(permission))
      },
      
      initializeFromStorage: (): boolean => {
        console.log('initializeFromStorage called')
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          const storedUser = localStorage.getItem('user')
          const storedProfile = localStorage.getItem('profile')
          const refreshToken = localStorage.getItem('refreshToken')
          
          console.log('Storage check:', {
            hasToken: !!token,
            hasUser: !!storedUser,
            hasProfile: !!storedProfile,
            hasRefreshToken: !!refreshToken
          })
          
          if (token && storedUser) {
            try {
              const user: User = JSON.parse(storedUser)
              const profile = storedProfile ? JSON.parse(storedProfile) : null
              
              console.log('Restoring user from storage:', user)
              console.log('Restoring profile from storage:', profile)
              
              set({ 
                user, 
                profile,
                accessToken: token,
                refreshToken,
                isAuthenticated: true 
              })
              return true
            } catch (error) {
              console.error('Failed to parse stored user or profile:', error)
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
      
      // Role and permission helpers
      getUserRoleInfo: () => {
        const { user } = get()
        if (!user) return null
        
        const getUserRoleDisplay = (role: string): string => {
          return role
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
        
        return {
          displayName: getUserRoleDisplay(user.role),
          role: user.role,
          isAdmin: user.role.includes('admin'),
          isSuperAdmin: user.role === 'super_super_admin' || user.role === 'super_admin',
          isManager: user.role.includes('manager') || user.role.includes('head'),
          isSupervisor: user.role.includes('supervisor'),
          isHR: user.role.includes('hr'),
          isFinance: user.role.includes('finance'),
        }
      },
      
      canAccessRoute: (requiredPermissions: string[]): boolean => {
        const { user, hasPermission } = get()
        if (!user) return false
        
        // Check for full system access permission
        if (hasPermission('system:full_access')) return true
        
        // Check if user has any of the required permissions
        return requiredPermissions.some(permission => hasPermission(permission))
      },
      
      canManageOrganization: (): boolean => {
        const { hasAnyPermission } = get()
        const orgManagePermissions = [
          'department:manage',
          'position:manage',
          'grade:manage',
          'system:full_access',
          'employees:manage_all'
        ]
        return hasAnyPermission(orgManagePermissions)
      },
      
      canViewOrganization: (): boolean => {
        const { hasAnyPermission } = get()
        const orgViewPermissions = [
          'department:view',
          'position:view',
          'grade:view',
          'system:full_access',
          'employees:manage_all',
          'team:manage',
          'direct_reports:manage'
        ]
        return hasAnyPermission(orgViewPermissions)
      },
      
      hasOrganizationPermission: (action: 'create' | 'view' | 'edit' | 'delete', resource: 'department' | 'position' | 'grade'): boolean => {
        const { hasPermission } = get()
        
        const permissionMap = {
          create: {
            department: 'department:manage',
            position: 'position:manage',
            grade: 'grade:manage',
          },
          view: {
            department: 'department:view',
            position: 'position:view',
            grade: 'grade:view',
          },
          edit: {
            department: 'department:manage',
            position: 'position:manage',
            grade: 'grade:manage',
          },
          delete: {
            department: 'department:manage',
            position: 'position:manage',
            grade: 'grade:manage',
          },
        }
        
        const permission = permissionMap[action]?.[resource]
        return permission ? hasPermission(permission) : false
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize,
    } as PersistOptions<AuthState, Partial<AuthState>>
  )
)

// Helper functions
export const getAuthState = (): AuthState => {
  return useAuthStore.getState()
}

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
        const profile = localStorage.getItem('profile')
        const parsedProfile = profile ? JSON.parse(profile) : null
        
        useAuthStore.setState({
          user: parsedUser,
          profile: parsedProfile,
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

export const checkTokenExpired = (): boolean => {
  const state = getAuthState()
  const token = state.accessToken || localStorage.getItem('accessToken')
  
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const hasRole = (role: string | string[]): boolean => {
  const state = getAuthState()
  if (!state.user) return false
  
  if (Array.isArray(role)) {
    return role.includes(state.user.role)
  }
  return state.user.role === role
}

// Module-specific permission checks
export const canAccessEmployees = (): boolean => {
  const { hasAnyPermission } = getAuthState()
  return hasAnyPermission([
    'employees:manage_all',
    'employees:manage_department',
    'employees:view'
  ])
}

export const canAccessLoans = (): boolean => {
  const { hasAnyPermission } = getAuthState()
  return hasAnyPermission([
    'loans:manage',
    'loans:approve',
    'requests:create'
  ])
}

export const canAccessTravel = (): boolean => {
  const { hasAnyPermission } = getAuthState()
  return hasAnyPermission([
    'travel:manage',
    'travel:approve',
    'requests:create'
  ])
}

export const canAccessOvertime = (): boolean => {
  const { hasAnyPermission } = getAuthState()
  return hasAnyPermission([
    'overtime:manage',
    'overtime:approve',
    'requests:create'
  ])
}

export const canAccessPayroll = (): boolean => {
  const { hasAnyPermission } = getAuthState()
  return hasAnyPermission(['payroll:manage'])
}

export const canAccessReports = (): boolean => {
  const { hasAnyPermission } = getAuthState()
  return hasAnyPermission([
    'reports:view',
    'reports:generate'
  ])
}

export const canAccessAdmin = (): boolean => {
  const { hasAnyPermission } = getAuthState()
  return hasAnyPermission([
    'system:full_access',
    'users:manage_all',
    'users:manage_super_admins',
    'roles:manage_all',
    'users:manage_permissions',
    'audit_logs:view',
    'settings:manage'
  ])
}

// Initialize auth from storage on module load
if (typeof window !== 'undefined') {
  // Small delay to ensure Zustand is ready
  setTimeout(() => {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    const profile = localStorage.getItem('profile')
    
    if (token && user && !useAuthStore.getState().isAuthenticated) {
      try {
        const parsedUser: User = JSON.parse(user)
        const parsedProfile = profile ? JSON.parse(profile) : null
        
        useAuthStore.setState({
          user: parsedUser,
          profile: parsedProfile,
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