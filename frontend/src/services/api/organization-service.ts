import { Department, Grade, Position, PaginatedResponse } from '@/types/organization'

// Simple fetch wrapper
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }

  return response.json()
}

export const organizationService = {
  // Departments
  getDepartments: async (params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    includeRelations?: boolean
    includeEmployeeCount?: boolean
    includeSubDepartments?: boolean
  }): Promise<PaginatedResponse<Department>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
    if (params?.includeRelations) queryParams.append('includeRelations', 'true')
    if (params?.includeEmployeeCount) queryParams.append('includeEmployeeCount', 'true')
    if (params?.includeSubDepartments) queryParams.append('includeSubDepartments', 'true')
    
    return fetchWithAuth(`/departments?${queryParams.toString()}`)
  },

  getDepartmentById: async (departmentId: string): Promise<Department> => {
    return fetchWithAuth(`/departments/${departmentId}`)
  },

  createDepartment: async (data: {
    departmentName: string
    departmentCode: string
    description?: string
    parentDepartmentId?: string
    departmentHeadPositionId?: string
  }): Promise<Department> => {
    return fetchWithAuth('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateDepartment: async (departmentId: string, data: Partial<Department>): Promise<Department> => {
    return fetchWithAuth(`/departments/${departmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteDepartment: async (departmentId: string): Promise<void> => {
    await fetchWithAuth(`/departments/${departmentId}`, {
      method: 'DELETE',
    })
  },

  // Grades
  getGrades: async (params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    band?: string
    minLevel?: number
    maxLevel?: number
  }): Promise<PaginatedResponse<Grade>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
    if (params?.band) queryParams.append('band', params.band)
    if (params?.minLevel) queryParams.append('minLevel', params.minLevel.toString())
    if (params?.maxLevel) queryParams.append('maxLevel', params.maxLevel.toString())
    
    return fetchWithAuth(`/grades?${queryParams.toString()}`)
  },

  getGradeById: async (gradeId: string): Promise<Grade> => {
    return fetchWithAuth(`/grades/${gradeId}`)
  },

  createGrade: async (data: {
    name: string
    code: string
    level: number
    band: 'JUNIOR' | 'OPERATIONAL' | 'SUPERVISORY' | 'MANAGERIAL' | 'EXECUTIVE'
    description: string
    compensation: {
      basicSalary: {
        min: number
        mid: number
        max: number
      }
      houseAllowance: number
      carAllowance: number
      travelAllowance: number
      overtimeRate: number
    }
    limits?: {
      maxLoanAmount: number
      requiresManagerApproval: boolean
      requiresDirectorApproval: boolean
      maxApprovalLevel: string
    }
    isActive?: boolean
    nextGrade?: string
  }): Promise<Grade> => {
    return fetchWithAuth('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateGrade: async (gradeId: string, data: Partial<Grade>): Promise<Grade> => {
    return fetchWithAuth(`/grades/${gradeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteGrade: async (gradeId: string): Promise<void> => {
    await fetchWithAuth(`/grades/${gradeId}`, {
      method: 'DELETE',
    })
  },

  // Positions
  getPositions: async (params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    departmentId?: string
    gradeId?: string
    hasAvailability?: boolean
    includeRelations?: boolean
  }): Promise<PaginatedResponse<Position>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId)
    if (params?.gradeId) queryParams.append('gradeId', params.gradeId)
    if (params?.hasAvailability !== undefined) queryParams.append('hasAvailability', params.hasAvailability.toString())
    if (params?.includeRelations) queryParams.append('includeRelations', 'true')
    
    return fetchWithAuth(`/positions?${queryParams.toString()}`)
  },

  getPositionById: async (positionId: string): Promise<Position> => {
    return fetchWithAuth(`/positions/${positionId}`)
  },

  createPosition: async (data: {
    positionTitle: string
    positionCode: string
    departmentId: string
    gradeId: string
    reportsToPositionId?: string
    jobDescription?: string
    responsibilities?: string[]
    isHeadOfDepartment?: boolean
    isSupervisorRole?: boolean
    isManagerRole?: boolean
    isDirectorRole?: boolean
    numberOfPositions: number
  }): Promise<Position> => {
    return fetchWithAuth('/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updatePosition: async (positionId: string, data: Partial<Position>): Promise<Position> => {
    return fetchWithAuth(`/positions/${positionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deletePosition: async (positionId: string): Promise<void> => {
    await fetchWithAuth(`/positions/${positionId}`, {
      method: 'DELETE',
    })
  },

  // Hierarchy
  getPositionHierarchy: async (): Promise<Position[]> => {
    return fetchWithAuth('/positions/hierarchy')
  },

  // Simple fetch for now - you can expand this later
  getOrganizationStatistics: async (): Promise<any> => {
    try {
      // For now, let's fetch basic stats or return defaults
      return {
        totalDepartments: 12,
        totalEmployees: 288,
        totalPositions: 53,
        totalGrades: 13
      }
    } catch {
      return {
        totalDepartments: 0,
        totalEmployees: 0,
        totalPositions: 0,
        totalGrades: 0
      }
    }
  }
}