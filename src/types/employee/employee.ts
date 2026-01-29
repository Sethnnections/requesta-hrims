export interface Employee {
  _id: string
  employeeId: string
  employeeNumber: string
  firstName: string
  middleName?: string
  lastName: string
  fullName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  nationalId: string
  email: string
  personalEmail?: string
  phoneNumber: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  departmentId: {
    _id: string
    departmentName: string
    departmentCode: string
  }
  positionId: {
    _id: string
    positionTitle: string
    positionCode: string
  }
  gradeId: {
    _id: string
    name: string
    code: string
    level: number
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
    limits: {
      maxLoanAmount: number
      requiresManagerApproval: boolean
      requiresDirectorApproval: boolean
      maxApprovalLevel: string
    }
  }
  reportsToEmployeeId?: {
    _id: string
    employeeNumber: string
    firstName: string
    lastName: string
    fullName: string
  }
  employmentDate: string
  contractType: 'PROBATION' | 'CONTRACT' | 'PERMANENT'
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED'
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  taxIdentificationNumber?: string
  pensionNumber?: string
  currentBasicSalary: number
  hasSystemAccess: boolean
  systemUsername?: string
  systemRole?: string
  isSupervisor: boolean
  isDepartmentManager: boolean
  profileVerified: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Department {
  _id: string
  departmentName: string
  departmentCode: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Position {
  _id: string
  positionTitle: string
  positionCode: string
  departmentId: string
  gradeId: string
  responsibilities: string[]
  isHeadOfDepartment: boolean
  isSupervisorRole: boolean
  isManagerRole: boolean
  isDirectorRole: boolean
  numberOfPositions: number
  currentlyFilled: number
  availablePositions: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Grade {
  _id: string
  name: string
  code: string
  level: number
  band: string
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
  limits: {
    maxLoanAmount: number
    requiresManagerApproval: boolean
    requiresDirectorApproval: boolean
    maxApprovalLevel: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmployeeRegistrationData {
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  nationalId: string
  email: string
  phoneNumber: string
  personalEmail?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  departmentId: string
  positionId: string
  gradeId: string
  reportsToEmployeeId?: string
  employmentDate: string
  contractType: 'PROBATION' | 'CONTRACT' | 'PERMANENT'
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  taxIdentificationNumber?: string
  pensionNumber?: string
  currentBasicSalary: number
  createSystemAccess: boolean
  systemUsername?: string
  isSupervisor: boolean
  isDepartmentManager: boolean
  systemRole?: string
}

export interface SystemAccessData {
  systemUsername: string
  systemRole: string
  useEmailAsUsername: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}