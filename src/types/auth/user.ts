export interface User {
  _id: string
  userId: string
  username: string
  email: string
  role: UserRole
  employeeId: string
  mustChangePassword: boolean
  permissions: string[]
  profile?: {
    userId: string
    username: string
    email: string
    role: UserRole
    status: UserStatus
    loginMethod: string
    mustChangePassword: boolean
    emailVerified: boolean
    lastLoginAt: string
    lastActivityAt: string
    createdAt: string
    updatedAt: string
    permissions: string[]
    employee?: {
      employeeId: string
      employeeNumber: string
      firstName: string
      lastName: string
      email: string
      departmentId: string
      positionId: string
      gradeId: string
      employmentStatus: string
    }
  }
  avatar?: string
}

export enum UserRole {
  SUPER_SUPER_ADMIN = "super_super_admin",
  SUPER_ADMIN = "super_admin",
  SYSTEM_ADMIN = "system_admin",
  HR_ADMIN = "hr_admin",
  HR_MANAGER = "hr_manager",
  FINANCE_MANAGER = "finance_manager",
  DEPARTMENT_HEAD = "department_head",
  MANAGER = "manager",
  SUPERVISOR = "supervisor",
  EMPLOYEE = "employee",
  TRAVEL_ADMIN = "travel_admin",
  ADMIN_EMPLOYEE = "admin_employee",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}