export interface Department {
  _id: string;
  departmentName: string;
  departmentCode: string;
  description?: string;
  parentDepartmentId?: string;
  departmentHeadPositionId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  parentDepartment?: {
    _id: string;
    departmentName: string;
    departmentCode: string;
  };
  departmentHeadPosition?: {
    _id: string;
    positionTitle: string;
    positionCode: string;
  };
  subDepartments?: Department[];
  employeeCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}