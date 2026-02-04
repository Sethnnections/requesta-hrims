import {
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

export class LoanService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

  // Loan Applications Endpoints

  async createLoanApplication(data: CreateLoanApplicationData): Promise<LoanApplication> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create loan application')
    }

    return response.json()
  }

  async getLoanApplications(params?: {
    page?: number
    limit?: number
    status?: string
    loanType?: string
    employeeId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<LoanApplication>> {
    const token = localStorage.getItem('accessToken')
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${this.baseUrl}/loan-applications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch loan applications')
    }

    return response.json()
  }

  async getLoanApplicationById(loanId: string): Promise<LoanApplication> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-applications/${loanId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch loan application')
    }

    return response.json()
  }

  async disburseLoan(loanId: string, data: DisbursementData): Promise<LoanApplication> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-applications/${loanId}/disburse`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to disburse loan')
    }

    return response.json()
  }

  async cancelLoan(loanId: string, data: CancellationData): Promise<LoanApplication> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-applications/${loanId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to cancel loan')
    }

    return response.json()
  }

  async getEmployeeLoanStatistics(employeeId: string): Promise<LoanStatistics> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-applications/employee/${employeeId}/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch loan statistics')
    }

    return response.json()
  }

  // Loan Types Endpoints

  async createLoanType(data: CreateLoanTypeData): Promise<LoanType> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-types`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create loan type')
    }

    return response.json()
  }

  async getLoanTypes(params?: {
    page?: number
    limit?: number
    isActive?: boolean
    search?: string
  }): Promise<PaginatedResponse<LoanType>> {
    const token = localStorage.getItem('accessToken')
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${this.baseUrl}/loan-types?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch loan types')
    }

    return response.json()
  }

  async getLoanTypeById(loanTypeId: string): Promise<LoanType> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-types/${loanTypeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch loan type')
    }

    return response.json()
  }

  async updateLoanType(loanTypeId: string, data: UpdateLoanTypeData): Promise<LoanType> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-types/${loanTypeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update loan type')
    }

    return response.json()
  }

  async deleteLoanType(loanTypeId: string): Promise<void> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-types/${loanTypeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete loan type')
    }
  }

  async getLoanTypeByCode(code: string): Promise<LoanType> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-types/code/${code}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch loan type')
    }

    return response.json()
  }

  async toggleLoanTypeActive(loanTypeId: string): Promise<LoanType> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/loan-types/${loanTypeId}/toggle-active`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to toggle loan type active status')
    }

    return response.json()
  }
}

export const loanService = new LoanService()