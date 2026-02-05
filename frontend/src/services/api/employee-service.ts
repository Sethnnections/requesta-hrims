import {
  Employee,
  Department,
  Position,
  Grade,
  EmployeeRegistrationData,
  SystemAccessData,
  PaginatedResponse,
} from '@/types/employee/employee';

export class EmployeeService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Employee endpoints
  async registerEmployee(data: EmployeeRegistrationData): Promise<Employee> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register employee');
    }

    return response.json();
  }

  async activateSystemAccess(employeeId: string, data: SystemAccessData): Promise<Employee> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/${employeeId}/activate-system-access`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate system access');
    }

    return response.json();
  }

  async verifyProfile(employeeId: string): Promise<{ verified: boolean }> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/${employeeId}/verify-profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify profile');
    }

    return response.json();
  }

  async getRegistrationStatus(employeeId: string): Promise<{
    hasSystemAccess: boolean;
    profileVerified: boolean;
    registrationComplete: boolean;
    registrationStatus: string;
  }> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/${employeeId}/registration-status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get registration status');
    }

    const status = await response.json();

    // Ensure the response has the registrationStatus field
    return {
      hasSystemAccess: status.hasSystemAccess || false,
      profileVerified: status.profileVerified || false,
      registrationComplete: status.registrationComplete || false,
      registrationStatus: status.registrationStatus || 'PENDING',
    };
  }

  async requestRegistration(data: Partial<EmployeeRegistrationData>): Promise<Employee> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/request-registration`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request registration');
    }

    return response.json();
  }

  async approveRegistration(employeeId: string): Promise<Employee> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/${employeeId}/approve-registration`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve registration');
    }

    return response.json();
  }

  async getEmployees(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    department?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Employee>> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/employees?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    return response.json();
  }

  async getEmployeeById(employeeId: string): Promise<Employee> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/${employeeId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch employee');
    }

    return response.json();
  }

  async checkSupervisorStatus(employeeId: string): Promise<{
    message: string;
    previous: {
      isSupervisor: boolean;
      isDepartmentManager: boolean;
    };
    updated: {
      isSupervisor: boolean;
      isDepartmentManager: boolean;
    };
    reasons: {
      positionBased: {
        supervisor: boolean;
        manager: boolean;
        positionTitle: string;
      };
      gradeBased: {
        supervisor: boolean;
        manager: boolean;
        gradeCode: string;
        gradeLevel: number;
      };
    };
  }> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(
      `${this.baseUrl}/employees/${employeeId}/check-supervisor-status`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check supervisor status');
    }

    return response.json();
  }

  // Department endpoints
  async getDepartments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Department>> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/departments?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }

    return response.json();
  }

  async getDepartmentById(departmentId: string): Promise<Department> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/departments/${departmentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch department');
    }

    return response.json();
  }

  // Position endpoints
  async getPositions(params?: {
    page?: number;
    limit?: number;
    departmentId?: string;
    gradeId?: string;
    isActive?: boolean;
    hasVacancies?: boolean;
  }): Promise<PaginatedResponse<Position>> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/positions?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch positions');
    }

    return response.json();
  }

  // Grade endpoints
  async getGrades(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    band?: string;
    minLevel?: number;
    maxLevel?: number;
  }): Promise<PaginatedResponse<Grade>> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/grades?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch grades');
    }

    return response.json();
  }

  // Add this method to your EmployeeService class
  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}/employees/${employeeId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update employee');
    }

    return response.json();
  }
}

export const employeeService = new EmployeeService();
