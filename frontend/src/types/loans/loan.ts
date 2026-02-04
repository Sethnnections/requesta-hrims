export interface EmployeeBasicInfo {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  gradeCode: string
  fullName?: string
}

export interface LoanApplication {
  id: string
  employee: EmployeeBasicInfo
  loanType: string
  amount: number
  currency: string
  purpose: string
  repaymentPeriod: number
  monthlyRepayment: number
  interestRate: number
  totalRepayment: number
  supportingDocuments: string[]
  workflowId: string
  status: LoanStatus
  metadata?: Record<string, any>
  disbursementDate?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface LoanType {
  _id: string
  code: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
  minRepaymentPeriod: number
  maxRepaymentPeriod: number
  interestRate: number
  processingFee: number
  isActive: boolean
  eligibleGrades: string[]
  requiredDocuments: string[]
  termsAndConditions: Record<string, any>
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface LoanStatistics {
  totalLoans: number
  totalAmount: number
  activeLoans: number
  pendingLoans: number
  approvedLoans: number
  rejectedLoans: number
  averageLoanAmount: number
  repaymentCompletion: number
  recentLoans: LoanApplication[]
}

export interface CreateLoanApplicationData {
  employeeId: string
  loanType: string
  amount: number
  currency?: string
  purpose: string
  repaymentPeriod: number
  supportingDocuments?: string[]
  metadata?: Record<string, any>
}

export interface CreateLoanTypeData {
  code: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
  minRepaymentPeriod: number
  maxRepaymentPeriod: number
  interestRate: number
  processingFee: number
  eligibleGrades: string[]
  requiredDocuments: string[]
  termsAndConditions: Record<string, any>
  isActive?: boolean
}

export interface UpdateLoanTypeData extends Partial<CreateLoanTypeData> {}

export interface DisbursementData {
  disbursementDate: string
}

export interface CancellationData {
  reason: string
}

export type LoanStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DEFAULTED'
  | 'CANCELLED'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}