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
  EMPLOYEE_REGISTRATION = 'EMPLOYEE_REGISTRATION'
}

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum ApprovalRule {
  SUPERVISOR = 'SUPERVISOR',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  HR_MANAGER = 'HR_MANAGER',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  SPECIFIC_USER = 'SPECIFIC_USER',
  ROLE_BASED = 'ROLE_BASED',
  ANY_MANAGER = 'ANY_MANAGER'
}

export interface WorkflowStage {
  stage: number;
  name: string;
  approvalRule: ApprovalRule;
  ruleConfig: Record<string, any>;
  approvers?: string[]; // User IDs who can approve
  minApprovals?: number;
  autoApproveAfter?: number; // Hours
}

export interface WorkflowDefinition {
  _id: string;
  name: string;
  workflowType: WorkflowType;
  department?: string;
  description?: string;
  stages: WorkflowStage[];
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface WorkflowInstance {
  _id: string;
  workflowDefinitionId: string;
  workflowType: WorkflowType;
  entityType: string; // EMPLOYEE, DEPARTMENT, etc
  entityId: string; // ID of the entity
  status: WorkflowStatus;
  currentStage: number;
  initiatedBy: string; // User ID
  initiatedAt: string;
  completedAt?: string;
  initialData: Record<string, any>;
  metadata?: Record<string, any>;
  approvals: WorkflowApproval[];
  comments: WorkflowComment[];
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  workflowDefinition?: WorkflowDefinition;
  entity?: any;
  initiatedByUser?: any;
}

export interface WorkflowApproval {
  _id: string;
  stage: number;
  approverId: string;
  action: 'APPROVED' | 'REJECTED' | 'DELEGATED';
  comments?: string;
  delegatedTo?: string;
  dataSnapshot?: Record<string, any>;
  approvedAt: string;
  
  // Populated fields
  approver?: any;
  delegatedToUser?: any;
}

export interface WorkflowComment {
  _id: string;
  userId: string;
  comment: string;
  createdAt: string;
  
  // Populated fields
  user?: any;
}

export interface Delegation {
  _id: string;
  delegatorId: string;
  delegateeId: string;
  workflowTypes: WorkflowType[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  delegator?: any;
  delegatee?: any;
}

export interface CreateWorkflowInstanceData {
  workflowDefinitionId?: string;
  workflowType: WorkflowType;
  entityType: string;
  entityId: string;
  initialData: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateWorkflowDefinitionData {
  name: string;
  workflowType: WorkflowType;
  department?: string;
  description?: string;
  stages: WorkflowStage[];
  isActive?: boolean;
}

export interface UpdateWorkflowDefinitionData {
  name?: string;
  workflowType?: WorkflowType;
  department?: string;
  description?: string;
  stages?: WorkflowStage[];
  isActive?: boolean;
}

export interface ApprovalActionData {
  action: 'APPROVE' | 'REJECT';
  comments?: string;
  delegatedTo?: string;
  dataSnapshot?: Record<string, any>;
}

export interface CreateDelegationData {
  delegateeId: string;
  workflowTypes: WorkflowType[];
  startDate: string;
  endDate?: string;
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

// For frontend display
export interface WorkflowTypeOption {
  value: WorkflowType;
  label: string;
  description: string;
}