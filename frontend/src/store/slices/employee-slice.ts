import { create } from 'zustand'
import { employeeService } from '@/services/api/employee-service'
import type { 
  Employee, 
  Department, 
  Position, 
  Grade,
  EmployeeRegistrationData,
  SystemAccessData,
  PaginatedResponse 
} from '@/types/employee/employee'

interface EmployeeState {
  // State
  employees: Employee[]
  currentEmployee: Employee | null
  departments: Department[]
  positions: Position[]
  grades: Grade[]
  isLoading: boolean
  error: string | null
  
  // Pagination
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  
  // Filters
  filters: {
    department?: string
    status?: string
    search?: string
  }
  
  // Actions
  fetchEmployees: (params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    department?: string
    status?: string
    search?: string
  }) => Promise<void>
  
  fetchEmployeeById: (employeeId: string) => Promise<void>
  
  registerEmployee: (data: EmployeeRegistrationData) => Promise<Employee>
  
  activateSystemAccess: (employeeId: string, data: SystemAccessData) => Promise<Employee>
  
  verifyProfile: (employeeId: string) => Promise<void>
  
  getRegistrationStatus: (employeeId: string) => Promise<{
    hasSystemAccess: boolean
    profileVerified: boolean
    registrationComplete: boolean
  }>
  
  requestRegistration: (data: Partial<EmployeeRegistrationData>) => Promise<Employee>
  
  approveRegistration: (employeeId: string) => Promise<Employee>
  
  checkSupervisorStatus: (employeeId: string) => Promise<void>
  
  fetchDepartments: (params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
  }) => Promise<void>
  
  fetchPositions: (params?: {
    page?: number
    limit?: number
    departmentId?: string
    gradeId?: string
    isActive?: boolean
    hasVacancies?: boolean
  }) => Promise<void>
  
  fetchGrades: (params?: {
    page?: number
    limit?: number
    isActive?: boolean
    band?: string
    minLevel?: number
    maxLevel?: number
  }) => Promise<void>
  
  setFilters: (filters: Partial<EmployeeState['filters']>) => void
  
  clearError: () => void
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  // Initial state
  employees: [],
  currentEmployee: null,
  departments: [],
  positions: [],
  grades: [],
  isLoading: false,
  error: null,
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  
  filters: {
    department: undefined,
    status: undefined,
    search: undefined,
  },
  
  // Actions
  fetchEmployees: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const { page = 1, limit = 10, ...filters } = params
      const response = await employeeService.getEmployees({
        page,
        limit,
        ...filters,
      })
      
      set({
        employees: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage,
        },
        isLoading: false,
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  fetchEmployeeById: async (employeeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const employee = await employeeService.getEmployeeById(employeeId)
      set({ currentEmployee: employee, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  registerEmployee: async (data: EmployeeRegistrationData) => {
    set({ isLoading: true, error: null })
    
    try {
      const employee = await employeeService.registerEmployee(data)
      set({ isLoading: false })
      return employee
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  activateSystemAccess: async (employeeId: string, data: SystemAccessData) => {
    set({ isLoading: true, error: null })
    
    try {
      const employee = await employeeService.activateSystemAccess(employeeId, data)
      set({ isLoading: false })
      return employee
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  verifyProfile: async (employeeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await employeeService.verifyProfile(employeeId)
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  getRegistrationStatus: async (employeeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const status = await employeeService.getRegistrationStatus(employeeId)
      set({ isLoading: false })
      return status
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  requestRegistration: async (data: Partial<EmployeeRegistrationData>) => {
    set({ isLoading: true, error: null })
    
    try {
      const employee = await employeeService.requestRegistration(data)
      set({ isLoading: false })
      return employee
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  approveRegistration: async (employeeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const employee = await employeeService.approveRegistration(employeeId)
      set({ isLoading: false })
      return employee
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  checkSupervisorStatus: async (employeeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await employeeService.checkSupervisorStatus(employeeId)
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  fetchDepartments: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await employeeService.getDepartments(params)
      set({ departments: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  fetchPositions: async (params = {}) => {
  set({ isLoading: true, error: null })
  
  try {
    // Always filter for active positions with vacancies by default
    const response = await employeeService.getPositions({
      ...params,
      isActive: true,
      hasVacancies: true, 
    })
    
    set({ 
      positions: response.data, 
      isLoading: false 
    })
  } catch (error: any) {
    set({ 
      error: error.message, 
      isLoading: false,
      positions: [] // Reset positions on error
    })
    throw error
  }
},
  
  fetchGrades: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await employeeService.getGrades(params)
      set({ grades: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },
  
  clearError: () => set({ error: null }),
}))