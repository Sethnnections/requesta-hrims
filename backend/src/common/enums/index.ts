export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CLOSED = 'CLOSED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}

export enum PaymentMethod {
  BANK_FILE = 'BANK_FILE',
  DIRECT_API = 'DIRECT_API',
  CHEQUE = 'CHEQUE',
  CASH = 'CASH',
}

export enum TravelType {
  LOCAL = 'LOCAL',
  DOMESTIC = 'DOMESTIC',
  INTERNATIONAL = 'INTERNATIONAL',
}

export enum AccommodationType {
  FULLY_PAID = 'FULLY_PAID',
  OUT_OF_POCKET = 'OUT_OF_POCKET',
  PER_DIEM_ONLY = 'PER_DIEM_ONLY',
}

export enum TravelStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SETTLEMENT_PENDING = 'SETTLEMENT_PENDING',
  SETTLED = 'SETTLED',
}

export enum TravelPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TransportMode {
  FLIGHT = 'FLIGHT',
  COMPANY_VEHICLE = 'COMPANY_VEHICLE',
  PERSONAL_VEHICLE = 'PERSONAL_VEHICLE',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  TAXI = 'TAXI',
}


export enum DocumentType {
  ID_CARD = 'ID_CARD',
  CERTIFICATE = 'CERTIFICATE',
  RECEIPT = 'RECEIPT',
  CONTRACT = 'CONTRACT',
  PAYSLIP = 'PAYSLIP',
  OTHER = 'OTHER',
}

export enum ContractType {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  PROBATION = 'PROBATION',
}

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  APPROVED = 'APPROVED',
  REJECT = 'REJECT',
  REJECTED = 'REJECTED',
  SEND_BACK = 'SEND_BACK',
  SENT_BACK = 'SENT_BACK',
  DELEGATE = 'DELEGATE',
  DELEGATED = 'DELEGATED',
  ESCALATE = 'ESCALATE',
}

export enum EscalationReason {
  URGENT_CLIENT_REQUIREMENT = 'URGENT_CLIENT_REQUIREMENT',
  BUDGET_CONSTRAINT = 'BUDGET_CONSTRAINT',
  POLICY_INTERPRETATION_NEEDED = 'POLICY_INTERPRETATION_NEEDED',
  MISSING_INFORMATION = 'MISSING_INFORMATION',
  APPROVER_UNAVAILABLE = 'APPROVER_UNAVAILABLE',
  COMPLEX_CASE = 'COMPLEX_CASE',
}

export enum Currency {
  MWK = 'MWK',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

// User and System Enums - STANDARDIZED TO LOWERCASE
export enum UserRole {
  SUPER_SUPER_ADMIN = 'super_super_admin',
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  HR_ADMIN = 'hr_admin',
  HR_MANAGER = 'hr_manager',
  FINANCE_MANAGER = 'finance_manager',
  DEPARTMENT_HEAD = 'department_head',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
  TRAVEL_ADMIN = 'travel_admin',
  ADMIN_EMPLOYEE = 'admin_employee',
}

// Alias for backward compatibility (keep uppercase if needed elsewhere)
export enum SystemRole {
  SUPER_SUPER_ADMIN = 'super_super_admin',
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  HR_ADMIN = 'hr_admin',
  HR_MANAGER = 'hr_manager',
  FINANCE_MANAGER = 'finance_manager',
  DEPARTMENT_HEAD = 'department_head',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
  TRAVEL_ADMIN = 'travel_admin',
  ADMIN_EMPLOYEE = 'admin_employee',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum LoginMethod {
  USERNAME = 'username',
  EMAIL = 'email',
  BOTH = 'both',
}

// common/enums/index.ts
export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum WorkflowType {
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LOAN_APPLICATION = 'LOAN_APPLICATION',
  TRAVEL_REQUEST = 'TRAVEL_REQUEST',
  OVERTIME_CLAIM = 'OVERTIME_CLAIM',
  PAYROLL_APPROVAL = 'PAYROLL_APPROVAL',
  EXPENSE_CLAIM = 'EXPENSE_CLAIM',
  RECRUITMENT = 'RECRUITMENT',
  PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',
  SYSTEM_CONFIGURATION = 'SYSTEM_CONFIGURATION',
  ALL = 'ALL',
}

export enum EntityType {
  EMPLOYEE = 'EMPLOYEE',
  LOAN_APPLICATION = 'LOAN_APPLICATION',
  TRAVEL_REQUEST = 'TRAVEL_REQUEST',
  OVERTIME_CLAIM = 'OVERTIME_CLAIM',
  PAYSLIP = 'PAYSLIP',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
}

export enum StageType {
  INITIAL = 'INITIAL',
  APPROVAL = 'APPROVAL',
  REVIEW = 'REVIEW',
  VERIFICATION = 'VERIFICATION',
  FINAL = 'FINAL',
}

export enum ApprovalRuleType {
  MANAGERIAL_LEVEL = 'MANAGERIAL_LEVEL',
  GRADE_BASED = 'GRADE_BASED',
  ROLE_BASED = 'ROLE_BASED',
  AMOUNT_BASED = 'AMOUNT_BASED',
  SPECIFIC_USER = 'SPECIFIC_USER',
}

export * from  './overtime.enum';
export * from './email.enum';
export * from './travel.enum';