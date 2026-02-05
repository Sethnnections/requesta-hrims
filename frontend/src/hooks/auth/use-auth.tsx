'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/slices/auth-slice';
import { PERMISSIONS, hasPermission, canAccessRoute, getUserRoleDisplay } from '@/lib/permissions';
import type { User, UserProfile } from '@/types/auth/user';

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    user,
    profile,
    setUser,
    setTokens,
    clearUser,
    hasPermission: storeHasPermission,
    isAuthenticated,
  } = useAuthStore();

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(
        'Making login request to:',
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        }
      );

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      console.log('Login success data:', data);

      // Store tokens and user data
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);

      // Force state update before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Also set cookies for middleware
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400; SameSite=Lax`;
      }

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearUser();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
    }
    router.push('/login');
  }, [clearUser, router]);

  // Permission checks using the store's hasPermission method
  const hasPerm = useCallback(
    (permission: string) => {
      return storeHasPermission(permission);
    },
    [storeHasPermission]
  );

  // Alternative permission check using direct user permissions
  const checkPermission = useCallback(
    (permission: string) => {
      return user?.permissions?.includes(permission) || false;
    },
    [user]
  );

  const canAccess = useCallback(
    (requiredPermissions: string[]) => {
      if (!user) return false;
      return canAccessRoute(user, requiredPermissions as any);
    },
    [user]
  );

  // Role-based navigation items
  const getNavigationItems = useCallback(() => {
    if (!user) return [];

    const baseItems: Array<{ name: string; href: string; icon: string; badge?: string }> = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'My Profile', href: '/profile', icon: 'user' },
    ];

    // Employees - Check all employee permissions
    if (
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_DEPARTMENT) ||
      hasPerm(PERMISSIONS.EMPLOYEES_VIEW)
    ) {
      baseItems.push({ name: 'Employees', href: '/employees/directory', icon: 'users' });
    }

    // Loans - Check all loan permissions
    if (
      hasPerm(PERMISSIONS.LOANS_MANAGE) ||
      hasPerm(PERMISSIONS.LOANS_APPROVE) ||
      hasPerm(PERMISSIONS.REQUESTS_CREATE)
    ) {
      baseItems.push({ name: 'Loans', href: '/loans/applications', icon: 'banknote' });
    }

    // Travel - Check all travel permissions
    if (
      hasPerm(PERMISSIONS.TRAVEL_MANAGE) ||
      hasPerm(PERMISSIONS.TRAVEL_APPROVE) ||
      hasPerm(PERMISSIONS.REQUESTS_CREATE)
    ) {
      baseItems.push({ name: 'Travel', href: '/travel/requests', icon: 'plane' });
    }

    // Overtime - Check all overtime permissions
    if (
      hasPerm(PERMISSIONS.OVERTIME_MANAGE) ||
      hasPerm(PERMISSIONS.OVERTIME_APPROVE) ||
      hasPerm(PERMISSIONS.REQUESTS_CREATE)
    ) {
      baseItems.push({ name: 'Overtime', href: '/overtime/claims', icon: 'clock' });
    }

    // Payroll - Check payroll permissions
    if (hasPerm(PERMISSIONS.PAYROLL_MANAGE)) {
      baseItems.push({ name: 'Payroll', href: '/payroll/payslips', icon: 'dollar-sign' });
    }

    // Reports - Check report permissions
    if (hasPerm(PERMISSIONS.REPORTS_VIEW) || hasPerm(PERMISSIONS.REPORTS_GENERATE)) {
      baseItems.push({ name: 'Reports', href: '/reports', icon: 'bar-chart' });
    }

    // Organization Module - Check all organization permissions
    const canAccessOrganization =
      hasPerm(PERMISSIONS.DEPARTMENT_MANAGE) ||
      hasPerm(PERMISSIONS.DEPARTMENT_VIEW) ||
      hasPerm(PERMISSIONS.POSITION_MANAGE) ||
      hasPerm(PERMISSIONS.POSITION_VIEW) ||
      hasPerm(PERMISSIONS.GRADE_MANAGE) ||
      hasPerm(PERMISSIONS.GRADE_VIEW) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) || // HR Admins and above can access organization
      hasPerm(PERMISSIONS.TEAM_MANAGE) || // Managers and above
      hasPerm(PERMISSIONS.DIRECT_REPORTS_MANAGE); // Supervisors

    if (canAccessOrganization) {
      baseItems.push({
        name: 'Organization',
        href: '/organization/departments',
        icon: 'building',
        badge: user?.role?.includes('admin') ? 'Admin' : undefined,
      });
    }

    // Approvals - Check all approval permissions
    // const hasApprovalPermission =
    //   hasPerm(PERMISSIONS.APPROVALS_DEPARTMENT) ||
    //   hasPerm(PERMISSIONS.APPROVALS_TEAM) ||
    //   hasPerm(PERMISSIONS.APPROVALS_DIRECT_REPORTS) ||
    //   hasPerm(PERMISSIONS.LOANS_APPROVE) ||
    //   hasPerm(PERMISSIONS.TRAVEL_APPROVE) ||
    //   hasPerm(PERMISSIONS.OVERTIME_APPROVE)

    // if (hasApprovalPermission) {
    //   const approvalBadge = user?.pendingApprovals ? user.pendingApprovals.toString() : undefined
    //   baseItems.push({
    //     name: 'Approvals',
    //     href: '/workflows/approvals',
    //     icon: 'check-circle',
    //     badge: approvalBadge
    //   })
    // }

    // Admin Dashboard - Check admin permissions
    const hasAdminPermission =
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.USERS_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.USERS_MANAGE_SUPER_ADMINS) ||
      hasPerm(PERMISSIONS.ROLES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.USERS_MANAGE_PERMISSIONS) ||
      hasPerm(PERMISSIONS.AUDIT_LOGS_VIEW) ||
      hasPerm(PERMISSIONS.SETTINGS_MANAGE);

    if (hasAdminPermission) {
      baseItems.push({
        name: 'Admin',
        href: '/admin/dashboard',
        icon: 'shield',
        badge: 'Admin',
      });
    }

    // Help & Support - Available to all authenticated users
    baseItems.push({
      name: 'Help & Support',
      href: '/help-support',
      icon: 'help-circle',
    });

    return baseItems;
  }, [user, hasPerm]);

  // Get organization sub-navigation items
  // Add this function to your useAuth hook:
  const getOrganizationSubItems = useCallback(() => {
    if (!user) return [];

    const subItems: Array<{ name: string; href: string; permission: string }> = [];

    // Departments
    if (
      hasPerm(PERMISSIONS.DEPARTMENT_MANAGE) ||
      hasPerm(PERMISSIONS.DEPARTMENT_VIEW) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.TEAM_MANAGE)
    ) {
      subItems.push({
        name: 'Departments',
        href: '/organization/departments',
        permission: hasPerm(PERMISSIONS.DEPARTMENT_MANAGE)
          ? PERMISSIONS.DEPARTMENT_MANAGE
          : PERMISSIONS.DEPARTMENT_VIEW,
      });
    }

    // Positions
    if (
      hasPerm(PERMISSIONS.POSITION_MANAGE) ||
      hasPerm(PERMISSIONS.POSITION_VIEW) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.TEAM_MANAGE)
    ) {
      subItems.push({
        name: 'Positions',
        href: '/organization/positions',
        permission: hasPerm(PERMISSIONS.POSITION_MANAGE)
          ? PERMISSIONS.POSITION_MANAGE
          : PERMISSIONS.POSITION_VIEW,
      });
    }

    // Grades
    if (
      hasPerm(PERMISSIONS.GRADE_MANAGE) ||
      hasPerm(PERMISSIONS.GRADE_VIEW) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.PAYROLL_MANAGE)
    ) {
      subItems.push({
        name: 'Grades',
        href: '/organization/grades',
        permission: hasPerm(PERMISSIONS.GRADE_MANAGE)
          ? PERMISSIONS.GRADE_MANAGE
          : PERMISSIONS.GRADE_VIEW,
      });
    }

    // Structure
    if (
      hasPerm(PERMISSIONS.DEPARTMENT_VIEW) ||
      hasPerm(PERMISSIONS.POSITION_VIEW) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.TEAM_MANAGE) ||
      hasPerm(PERMISSIONS.DIRECT_REPORTS_MANAGE)
    ) {
      subItems.push({
        name: 'Structure',
        href: '/organization/structure',
        permission: PERMISSIONS.DEPARTMENT_VIEW,
      });
    }

    return subItems;
  }, [user, hasPerm]);
  // Get create actions for organization module
  const getOrganizationCreateActions = useCallback(() => {
    if (!user) return [];

    const createActions: Array<{ name: string; href: string; permission: string }> = [];

    // Create Department
    if (
      hasPerm(PERMISSIONS.DEPARTMENT_MANAGE) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL)
    ) {
      createActions.push({
        name: 'Create Department',
        href: '/organization/departments/create',
        permission: PERMISSIONS.DEPARTMENT_MANAGE,
      });
    }

    // Create Position
    if (
      hasPerm(PERMISSIONS.POSITION_MANAGE) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL)
    ) {
      createActions.push({
        name: 'Create Position',
        href: '/organization/positions/create',
        permission: PERMISSIONS.POSITION_MANAGE,
      });
    }

    // Create Grade
    if (
      hasPerm(PERMISSIONS.GRADE_MANAGE) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.PAYROLL_MANAGE)
    ) {
      createActions.push({
        name: 'Create Grade',
        href: '/organization/grades/create',
        permission: PERMISSIONS.GRADE_MANAGE,
      });
    }

    return createActions;
  }, [user, hasPerm]);

  // Profile management
  const loadUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/profile/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const profileData = await response.json();

      // Store profile in auth store (need to update store to include setProfile)
      if (typeof window !== 'undefined') {
        localStorage.setItem('profile', JSON.stringify(profileData));
      }

      return profileData;
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
      if (!user) return null;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/profile/${user._id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        const updatedProfile = await response.json();

        // Store profile in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
        }

        return updatedProfile;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update profile');
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Check organization permissions
  const canManageOrganization = useCallback(() => {
    if (!user) return false;

    return (
      hasPerm(PERMISSIONS.DEPARTMENT_MANAGE) ||
      hasPerm(PERMISSIONS.POSITION_MANAGE) ||
      hasPerm(PERMISSIONS.GRADE_MANAGE) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL)
    );
  }, [user, hasPerm]);

  const canViewOrganization = useCallback(() => {
    if (!user) return false;

    return (
      hasPerm(PERMISSIONS.DEPARTMENT_VIEW) ||
      hasPerm(PERMISSIONS.POSITION_VIEW) ||
      hasPerm(PERMISSIONS.GRADE_VIEW) ||
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.TEAM_MANAGE) ||
      hasPerm(PERMISSIONS.DIRECT_REPORTS_MANAGE)
    );
  }, [user, hasPerm]);

  // Helper to check specific organization permissions
  const hasOrganizationPermission = useCallback(
    (
      action: 'create' | 'view' | 'edit' | 'delete',
      resource: 'department' | 'position' | 'grade'
    ) => {
      const permissionMap = {
        create: {
          department: PERMISSIONS.DEPARTMENT_MANAGE,
          position: PERMISSIONS.POSITION_MANAGE,
          grade: PERMISSIONS.GRADE_MANAGE,
        },
        view: {
          department: PERMISSIONS.DEPARTMENT_VIEW,
          position: PERMISSIONS.POSITION_VIEW,
          grade: PERMISSIONS.GRADE_VIEW,
        },
        edit: {
          department: PERMISSIONS.DEPARTMENT_MANAGE,
          position: PERMISSIONS.POSITION_MANAGE,
          grade: PERMISSIONS.GRADE_MANAGE,
        },
        delete: {
          department: PERMISSIONS.DEPARTMENT_MANAGE,
          position: PERMISSIONS.POSITION_MANAGE,
          grade: PERMISSIONS.GRADE_MANAGE,
        },
      };

      const permission = permissionMap[action]?.[resource];
      return permission ? hasPerm(permission) : false;
    },
    [hasPerm]
  );

  // Get user role-based display information
  const getUserRoleInfo = useCallback(() => {
    if (!user) return null;

    return {
      displayName: getUserRoleDisplay(user.role),
      role: user.role,
      isAdmin: user.role.includes('admin'),
      isSuperAdmin: user.role === 'super_super_admin' || user.role === 'super_admin',
      isManager: user.role.includes('manager') || user.role.includes('head'),
      isSupervisor: user.role.includes('supervisor'),
      isHR: user.role.includes('hr'),
      isFinance: user.role.includes('finance'),
    };
  }, [user]);

  // Check module access
  const canAccessEmployees = useCallback(() => {
    return (
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.EMPLOYEES_MANAGE_DEPARTMENT) ||
      hasPerm(PERMISSIONS.EMPLOYEES_VIEW)
    );
  }, [hasPerm]);

  const canAccessLoans = useCallback(() => {
    return (
      hasPerm(PERMISSIONS.LOANS_MANAGE) ||
      hasPerm(PERMISSIONS.LOANS_APPROVE) ||
      hasPerm(PERMISSIONS.REQUESTS_CREATE)
    );
  }, [hasPerm]);

  const canAccessTravel = useCallback(() => {
    return (
      hasPerm(PERMISSIONS.TRAVEL_MANAGE) ||
      hasPerm(PERMISSIONS.TRAVEL_APPROVE) ||
      hasPerm(PERMISSIONS.REQUESTS_CREATE)
    );
  }, [hasPerm]);

  const canAccessOvertime = useCallback(() => {
    return (
      hasPerm(PERMISSIONS.OVERTIME_MANAGE) ||
      hasPerm(PERMISSIONS.OVERTIME_APPROVE) ||
      hasPerm(PERMISSIONS.REQUESTS_CREATE)
    );
  }, [hasPerm]);

  const canAccessPayroll = useCallback(() => {
    return hasPerm(PERMISSIONS.PAYROLL_MANAGE);
  }, [hasPerm]);

  const canAccessReports = useCallback(() => {
    return hasPerm(PERMISSIONS.REPORTS_VIEW) || hasPerm(PERMISSIONS.REPORTS_GENERATE);
  }, [hasPerm]);

  const canAccessAdmin = useCallback(() => {
    return (
      hasPerm(PERMISSIONS.SYSTEM_FULL_ACCESS) ||
      hasPerm(PERMISSIONS.USERS_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.USERS_MANAGE_SUPER_ADMINS) ||
      hasPerm(PERMISSIONS.ROLES_MANAGE_ALL) ||
      hasPerm(PERMISSIONS.USERS_MANAGE_PERMISSIONS) ||
      hasPerm(PERMISSIONS.AUDIT_LOGS_VIEW) ||
      hasPerm(PERMISSIONS.SETTINGS_MANAGE)
    );
  }, [hasPerm]);

  // Token refresh
  const refreshToken = useCallback(async () => {
    try {
      const state = useAuthStore.getState();
      const refreshToken = state.refreshToken || localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      state.setTokens(data.accessToken, data.refreshToken);

      return data.accessToken;
    } catch (error: any) {
      logout();
      throw error;
    }
  }, [logout]);

  return {
    // User state
    user,
    profile,
    isAuthenticated,
    isLoading,

    // Authentication methods
    login,
    logout,
    refreshToken,

    // Permission methods
    hasPermission: hasPerm,
    checkPermission,
    canAccess,
    getUserRoleDisplay: () => (user ? getUserRoleDisplay(user.role) : ''),
    getUserRoleInfo,

    // Navigation methods
    getNavigationItems,
    getOrganizationSubItems,
    getOrganizationCreateActions,

    // Profile methods
    loadUserProfile,
    updateUserProfile,

    // Organization-specific methods
    canManageOrganization,
    canViewOrganization,
    hasOrganizationPermission,

    // Module access checks
    canAccessEmployees,
    canAccessLoans,
    canAccessTravel,
    canAccessOvertime,
    canAccessPayroll,
    canAccessReports,
    canAccessAdmin,

    // Token check
    isTokenExpired: () => {
      const state = useAuthStore.getState();
      const token = state.accessToken || localStorage.getItem('accessToken');

      if (!token) return true;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
      } catch {
        return true;
      }
    },

    // Check if user has specific role
    hasRole: useCallback(
      (role: string | string[]) => {
        if (!user) return false;

        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      },
      [user]
    ),
  };
}
