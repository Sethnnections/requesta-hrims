import { create } from 'zustand'
import { loanService } from '@/services/api/loan-service'
import type {
  LoanApplication,
  LoanType,
  LoanStatistics,
  CreateLoanApplicationData,
  CreateLoanTypeData,
  UpdateLoanTypeData,
  DisbursementData,
  CancellationData,
  PaginatedResponse
} from '@/types/loans/loan'

interface LoanState {
  // State
  loanApplications: LoanApplication[]
  currentLoanApplication: LoanApplication | null
  loanTypes: LoanType[]
  currentLoanType: LoanType | null
  loanStatistics: LoanStatistics | null
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
    status?: string
    loanType?: string
    employeeId?: string
  }
  
  // Actions
  createLoanApplication: (data: CreateLoanApplicationData) => Promise<LoanApplication>
  
  getLoanApplications: (params?: {
    page?: number
    limit?: number
    status?: string
    loanType?: string
    employeeId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => Promise<void>
  
  getLoanApplicationById: (loanId: string) => Promise<void>
  
  disburseLoan: (loanId: string, data: DisbursementData) => Promise<LoanApplication>
  
  cancelLoan: (loanId: string, data: CancellationData) => Promise<LoanApplication>
  
  getEmployeeLoanStatistics: (employeeId: string) => Promise<void>
  
  // Loan Types Actions
  createLoanType: (data: CreateLoanTypeData) => Promise<LoanType>
  
  getLoanTypes: (params?: {
    page?: number
    limit?: number
    isActive?: boolean
    search?: string
  }) => Promise<void>
  
  getLoanTypeById: (loanTypeId: string) => Promise<void>
  
  updateLoanType: (loanTypeId: string, data: UpdateLoanTypeData) => Promise<LoanType>
  
  deleteLoanType: (loanTypeId: string) => Promise<void>
  
  getLoanTypeByCode: (code: string) => Promise<LoanType>
  
  toggleLoanTypeActive: (loanTypeId: string) => Promise<LoanType>
  
  setFilters: (filters: Partial<LoanState['filters']>) => void
  
  clearError: () => void
}

export const useLoanStore = create<LoanState>((set, get) => ({
  // Initial state
  loanApplications: [],
  currentLoanApplication: null,
  loanTypes: [],
  currentLoanType: null,
  loanStatistics: null,
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
    status: undefined,
    loanType: undefined,
    employeeId: undefined,
  },
  
  // Actions
  createLoanApplication: async (data: CreateLoanApplicationData) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanApplication = await loanService.createLoanApplication(data)
      set({ isLoading: false })
      return loanApplication
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  getLoanApplications: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const { page = 1, limit = 10, ...filters } = params
      const response = await loanService.getLoanApplications({
        page,
        limit,
        ...filters,
      })
      
      set({
        loanApplications: response.data,
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
  
  getLoanApplicationById: async (loanId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanApplication = await loanService.getLoanApplicationById(loanId)
      set({ currentLoanApplication: loanApplication, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  disburseLoan: async (loanId: string, data: DisbursementData) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanApplication = await loanService.disburseLoan(loanId, data)
      set({ isLoading: false })
      return loanApplication
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  cancelLoan: async (loanId: string, data: CancellationData) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanApplication = await loanService.cancelLoan(loanId, data)
      set({ isLoading: false })
      return loanApplication
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  getEmployeeLoanStatistics: async (employeeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const statistics = await loanService.getEmployeeLoanStatistics(employeeId)
      set({ loanStatistics: statistics, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  // Loan Types Actions
  createLoanType: async (data: CreateLoanTypeData) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanType = await loanService.createLoanType(data)
      set({ isLoading: false })
      return loanType
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  getLoanTypes: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await loanService.getLoanTypes(params)
      set({ loanTypes: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  getLoanTypeById: async (loanTypeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanType = await loanService.getLoanTypeById(loanTypeId)
      set({ currentLoanType: loanType, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  updateLoanType: async (loanTypeId: string, data: UpdateLoanTypeData) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanType = await loanService.updateLoanType(loanTypeId, data)
      set({ isLoading: false })
      return loanType
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  deleteLoanType: async (loanTypeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await loanService.deleteLoanType(loanTypeId)
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  getLoanTypeByCode: async (code: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanType = await loanService.getLoanTypeByCode(code)
      set({ currentLoanType: loanType, isLoading: false })
      return loanType
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  toggleLoanTypeActive: async (loanTypeId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const loanType = await loanService.toggleLoanTypeActive(loanTypeId)
      set({ isLoading: false })
      return loanType
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