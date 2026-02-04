// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Requesta HRIMS',
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Human Resource Information Management System',
  COMPANY: process.env.NEXT_PUBLIC_COMPANY_NAME || 'ESCOM Malawi',
  COMPANY_SHORT: process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME || 'ESCOM',
} as const

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: process.env.NEXT_PUBLIC_TOKEN_KEY || 'requesta_access_token',
  REFRESH_TOKEN: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'requesta_refresh_token',
  USER_DATA: process.env.NEXT_PUBLIC_USER_KEY || 'requesta_user_data',
  THEME: 'requesta_theme',
  LANGUAGE: 'requesta_language',
} as const

// Route Paths
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Request modules
  LOANS: {
    INDEX: '/loans',
    APPLICATIONS: '/loans/applications',
    CREATE: '/loans/applications/create',
    MANAGEMENT: '/loans/management',
    CONFIGURATIONS: '/loans/configurations',
    REPORTS: '/loans/reports',
  },
  
  TRAVEL: {
    INDEX: '/travel',
    REQUESTS: '/travel/requests',
    CREATE: '/travel/requests/create',
    APPROVALS: '/travel/approvals',
    RATES: '/travel/rates',
    SETTLEMENTS: '/travel/settlements',
  },
  
  OVERTIME: {
    INDEX: '/overtime',
    CLAIMS: '/overtime/claims',
    CREATE: '/overtime/claims/create',
    APPROVALS: '/overtime/approvals',
    REPORTS: '/overtime/reports',
  },
  
  WORKFLOWS: {
    INDEX: '/workflows',
    CONFIGURATIONS: '/workflows/configurations',
    DEFINITIONS: '/workflows/configurations/definitions',
    INSTANCES: '/workflows/configurations/instances',
    APPROVALS: '/workflows/approvals',
  },
  
  ORGANIZATION: {
    INDEX: '/organization',
    DEPARTMENTS: '/organization/departments',
    GRADES: '/organization/grades',
    POSITIONS: '/organization/positions',
    STRUCTURE: '/organization/structure',
  },
  
  EMPLOYEES: {
    INDEX: '/employees',
    DIRECTORY: '/employees/directory',
    PROFILES: '/employees/profiles',
    ONBOARDING: '/employees/onboarding',
  },
  
  PAYROLL: {
    INDEX: '/payroll',
    PROCESSING: '/payroll/processing',
    PAYSLIPS: '/payroll/payslips',
    REPORTS: '/payroll/reports',
  },
  
  REPORTS: {
    INDEX: '/reports',
    HR_ANALYTICS: '/reports/hr-analytics',
    FINANCIAL: '/reports/financial',
    COMPLIANCE: '/reports/compliance',
  },
  
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    ROLES: '/admin/roles',
    SYSTEM: '/admin/system',
    AUDIT_LOGS: '/admin/audit-logs',
  },
} as const

// Role-based access
export const ROLES = {
  SUPER_SUPER_ADMIN: 'super_super_admin',
  SUPER_ADMIN: 'super_admin',
  ADMIN_EMPLOYEE: 'admin_employee',
  DEPARTMENT_HEAD: 'department_head',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
} as const

// Permissions
export const PERMISSIONS = {
  // System
  SYSTEM_FULL_ACCESS: 'system:full_access',
  USERS_MANAGE_SUPER_ADMINS: 'users:manage_super_admins',
  USERS_MANAGE_ALL: 'users:manage_all',
  ROLES_MANAGE_ALL: 'roles:manage_all',
  USERS_MANAGE_PERMISSIONS: 'users:manage_permissions',
  
  // Employees
  EMPLOYEES_MANAGE_ALL: 'employees:manage_all',
  
  // Department
  DEPARTMENT_MANAGE: 'department:manage',
  APPROVALS_DEPARTMENT: 'approvals:department',
  
  // Team
  TEAM_MANAGE: 'team:manage',
  APPROVALS_TEAM: 'approvals:team',
  
  // Direct reports
  DIRECT_REPORTS_MANAGE: 'direct_reports:manage',
  APPROVALS_DIRECT_REPORTS: 'approvals:direct_reports',
  
  // Profile
  PROFILE_MANAGE: 'profile:manage',
  
  // Requests
  REQUESTS_CREATE: 'requests:create',
  
  // Module-specific permissions
  LOANS_MANAGE: 'loans:manage',
  LOANS_APPROVE: 'loans:approve',
  LOANS_CONFIGURE: 'loans:configure',
  LOANS_VIEW_REPORTS: 'loans:view_reports',
  
  TRAVEL_MANAGE: 'travel:manage',
  TRAVEL_APPROVE: 'travel:approve',
  TRAVEL_CONFIGURE: 'travel:configure',
  
  OVERTIME_MANAGE: 'overtime:manage',
  OVERTIME_APPROVE: 'overtime:approve',
  OVERTIME_CONFIGURE: 'overtime:configure',
  
  WORKFLOWS_MANAGE: 'workflows:manage',
  WORKFLOWS_CONFIGURE: 'workflows:configure',
} as const

// Loan Types
export const LOAN_TYPES = [
  { value: 'PERSONAL', label: 'Personal Loan' },
  { value: 'HOUSING', label: 'Housing Loan' },
  { value: 'EDUCATION', label: 'Education Loan' },
  { value: 'EMERGENCY', label: 'Emergency Loan' },
  { value: 'VEHICLE', label: 'Vehicle Loan' },
  { value: 'BUSINESS', label: 'Business Development Loan' },
  { value: 'AGRICULTURE', label: 'Agricultural Inputs Loan' },
  { value: 'MEDICAL', label: 'Medical Treatment Loan' },
  { value: 'WEDDING', label: 'Wedding and Ceremony Loan' },
  { value: 'FURNITURE', label: 'Furniture and Appliances Loan' },
  { value: 'EXECUTIVE', label: 'Executive Loan' },
  { value: 'SALARY_ADVANCE', label: 'Salary Advance' },
] as const

// Travel Types
export const TRAVEL_TYPES = [
  { value: 'LOCAL', label: 'Local Travel' },
  { value: 'INTERNATIONAL', label: 'International Travel' },
] as const

// Overtime Types
export const OVERTIME_TYPES = [
  { value: 'REGULAR', label: 'Regular Overtime' },
  { value: 'WEEKEND', label: 'Weekend Overtime' },
  { value: 'HOLIDAY', label: 'Holiday Overtime' },
  { value: 'PUBLIC_HOLIDAY', label: 'Public Holiday Overtime' },
] as const

// Workflow Types
export const WORKFLOW_TYPES = [
  { value: 'LEAVE_REQUEST', label: 'Leave Request' },
  { value: 'TRAVEL_REQUEST', label: 'Travel Request' },
  { value: 'EXPENSE_CLAIM', label: 'Expense Claim' },
  { value: 'OVERTIME_CLAIM', label: 'Overtime Claim' },
  { value: 'LOAN_APPLICATION', label: 'Loan Application' },
  { value: 'RECRUITMENT', label: 'Recruitment' },
  { value: 'PERFORMANCE_REVIEW', label: 'Performance Review' },
  { value: 'PAYROLL_APPROVAL', label: 'Payroll Approval' },
] as const

// Statuses
export const STATUSES = {
  LOAN: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    DISBURSED: 'DISBURSED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    DEFAULTED: 'DEFAULTED',
    CANCELLED: 'CANCELLED',
  },
  TRAVEL: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  OVERTIME: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    AUTO_APPROVED: 'AUTO_APPROVED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PROCESSED: 'PROCESSED',
    CANCELLED: 'CANCELLED',
  },
  WORKFLOW: {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVED: 'ARCHIVED',
  },
} as const

// Currency
export const CURRENCIES = [
  { value: 'MWK', label: 'Malawian Kwacha', symbol: 'MK' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'ZAR', label: 'South African Rand', symbol: 'R' },
] as const

// Grades (from ESCOM organogram)
export const GRADES = [
  'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M13', 'M15', 'M17', 'CEO'
] as const

// Departments (from ESCOM structure)
export const DEPARTMENTS = [
  { value: 'EXEC', label: 'Executive Management' },
  { value: 'TECH', label: 'Technical & Field Operations' },
  { value: 'COMM', label: 'Commercial & Customer Service' },
  { value: 'FIN', label: 'Finance Department' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'HR', label: 'Human Resources & Administration' },
  { value: 'PROC', label: 'Procurement & Supply Chain' },
  { value: 'LEGAL', label: 'Legal & Compliance' },
] as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 25, 50, 100],
} as const

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const

// Validation
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    REGEX: /^\+?[\d\s\-\(\)]+$/,
  },
} as const
