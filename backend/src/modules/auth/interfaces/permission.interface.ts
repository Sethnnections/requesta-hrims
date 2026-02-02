export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
  allowedRoles: string[];
  requiresApproval?: boolean;
}

export interface UserPermissions {
  rolePermissions: string[];
  customPermissions: string[];
  effectivePermissions: string[];
  inheritedPermissions?: string[];
  deniedPermissions?: string[];
}

export interface RoleHierarchy {
  role: string;
  level: number;
  parentRole?: string;
  canManageRoles: string[];
  description: string;
}

// Comprehensive permission system
export const SYSTEM_PERMISSIONS: Permission[] = [
  // ==================== SUPER SUPER ADMIN PERMISSIONS ====================
  {
    id: 'system:full_access',
    module: 'system',
    action: 'full_access',
    description: 'Full system access including managing super admins',
    allowedRoles: ['super_super_admin']
  },
  {
    id: 'users:manage_super_admins',
    module: 'users',
    action: 'manage_super_admins',
    description: 'Manage super administrator accounts',
    allowedRoles: ['super_super_admin']
  },

  // ==================== SUPER ADMIN PERMISSIONS ====================
  {
    id: 'users:manage_all',
    module: 'users',
    action: 'manage_all',
    description: 'Manage all users except super super admins',
    allowedRoles: ['super_super_admin', 'super_admin']
  },
  {
    id: 'roles:manage_all',
    module: 'roles',
    action: 'manage_all',
    description: 'Manage all roles and permissions',
    allowedRoles: ['super_super_admin', 'super_admin']
  },

  // ==================== ADMIN EMPLOYEE PERMISSIONS ====================
  {
    id: 'users:manage_permissions',
    module: 'users',
    action: 'manage_permissions',
    description: 'Manage user permissions for roles below admin_employee',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee']
  },
  {
    id: 'employees:manage_all',
    module: 'employees',
    action: 'manage_all',
    description: 'Manage all employee records',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee']
  },

  // ==================== DEPARTMENT HEAD PERMISSIONS ====================
  {
    id: 'department:manage',
    module: 'department',
    action: 'manage',
    description: 'Manage own department employees and operations',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head']
  },
  {
    id: 'approvals:department',
    module: 'approvals',
    action: 'department',
    description: 'Approve department-level requests',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head']
  },

  // ==================== MANAGER PERMISSIONS ====================
  {
    id: 'team:manage',
    module: 'team',
    action: 'manage',
    description: 'Manage team members and their requests',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head', 'manager']
  },
  {
    id: 'approvals:team',
    module: 'approvals',
    action: 'team',
    description: 'Approve team-level requests',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head', 'manager']
  },

  // ==================== SUPERVISOR PERMISSIONS ====================
  {
    id: 'direct_reports:manage',
    module: 'direct_reports',
    action: 'manage',
    description: 'Manage direct reports',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head', 'manager', 'supervisor']
  },
  {
    id: 'approvals:direct_reports',
    module: 'approvals',
    action: 'direct_reports',
    description: 'Approve direct report requests',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head', 'manager', 'supervisor']
  },

  // ==================== EMPLOYEE PERMISSIONS ====================
  {
    id: 'profile:manage',
    module: 'profile',
    action: 'manage',
    description: 'Manage own profile',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head', 'manager', 'supervisor', 'employee']
  },
  {
    id: 'requests:create',
    module: 'requests',
    action: 'create',
    description: 'Create requests (leave, travel, etc.)',
    allowedRoles: ['super_super_admin', 'super_admin', 'admin_employee', 'department_head', 'manager', 'supervisor', 'employee']
  },

  // Add more permissions as needed...
];

export const ROLE_HIERARCHY: RoleHierarchy[] = [
  {
    role: 'super_super_admin',
    level: 1,
    canManageRoles: ['super_admin', 'admin_employee', 'system_admin', 'hr_admin', 'finance_manager', 'hr_manager', 'department_head', 'manager', 'supervisor', 'employee', 'travel_admin'],
    description: 'Full system access, can manage all users including super admins'
  },
  {
    role: 'super_admin',
    level: 2,
    parentRole: 'super_super_admin',
    canManageRoles: ['admin_employee', 'system_admin', 'hr_admin', 'finance_manager', 'hr_manager', 'department_head', 'manager', 'supervisor', 'employee', 'travel_admin'],
    description: 'Full system access, can manage all users except super super admins'
  },
  {
    role: 'admin_employee',
    level: 3,
    parentRole: 'super_admin',
    canManageRoles: ['system_admin', 'hr_admin', 'finance_manager', 'hr_manager', 'department_head', 'manager', 'supervisor', 'employee', 'travel_admin'],
    description: 'Admin who is also employee, can manage permissions and users'
  },
  {
    role: 'system_admin',
    level: 4,
    parentRole: 'admin_employee',
    canManageRoles: ['hr_admin', 'finance_manager', 'hr_manager', 'department_head', 'manager', 'supervisor', 'employee', 'travel_admin'],
    description: 'System administration access'
  },
  {
    role: 'hr_admin',
    level: 5,
    parentRole: 'system_admin',
    canManageRoles: ['hr_manager', 'department_head', 'manager', 'supervisor', 'employee'],
    description: 'HR administration access'
  },
  {
    role: 'finance_manager',
    level: 6,
    parentRole: 'system_admin',
    canManageRoles: ['manager', 'supervisor', 'employee'],
    description: 'Finance management access'
  },
  {
    role: 'hr_manager',
    level: 7,
    parentRole: 'hr_admin',
    canManageRoles: ['department_head', 'manager', 'supervisor', 'employee'],
    description: 'HR management access'
  },
  {
    role: 'department_head',
    level: 8,
    parentRole: 'hr_manager',
    canManageRoles: ['manager', 'supervisor', 'employee'],
    description: 'Department head access'
  },
  {
    role: 'manager',
    level: 9,
    parentRole: 'department_head',
    canManageRoles: ['supervisor', 'employee'],
    description: 'Manager access'
  },
  {
    role: 'supervisor',
    level: 10,
    parentRole: 'manager',
    canManageRoles: ['employee'],
    description: 'Supervisor access'
  },
  {
    role: 'employee',
    level: 11,
    parentRole: 'supervisor',
    canManageRoles: [],
    description: 'Employee access'
  },
  {
    role: 'travel_admin',
    level: 12,
    parentRole: 'system_admin',
    canManageRoles: [],
    description: 'Travel administration access'
  }
];