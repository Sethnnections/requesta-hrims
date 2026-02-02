import { Types, Document } from 'mongoose';
import { WorkflowType, WorkflowStatus, ApprovalAction } from '../../../common/enums';

export interface EmployeeLean {
  _id: Types.ObjectId;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  gradeId: Types.ObjectId | { _id: Types.ObjectId; code: string; level: number; name?: string };
  departmentId: Types.ObjectId;
  reportsToEmployeeId?: Types.ObjectId;
  systemRole: string;
  employmentStatus: string;
  isDepartmentManager: boolean;
  isSupervisor: boolean;
  __v: number;
}

export interface GradeInfo {
  _id: Types.ObjectId;
  code: string;
  level: number;
  name?: string;
}

// Helper to extract grade code from employee
export function getGradeCode(employee: EmployeeLean): string {
  if (!employee.gradeId) return 'UNKNOWN';
  
  if (typeof employee.gradeId === 'object' && 'code' in employee.gradeId) {
    return employee.gradeId.code;
  }
  
  return 'UNKNOWN';
}

// Helper to extract grade level from employee
export function getGradeLevel(employee: EmployeeLean): number {
  if (!employee.gradeId) return 0;
  
  if (typeof employee.gradeId === 'object' && 'level' in employee.gradeId) {
    return employee.gradeId.level;
  }
  
  return 0;
}
//  approval chain stage
export interface ApprovalChainStage {
  approverId: Types.ObjectId;
  approverGrade?: string;
  stage: number;
  stageName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELEGATED';
  action?: ApprovalAction;
  comments?: string;
  actionDate?: Date;
  delegatedTo?: Types.ObjectId;
}

//  approval history entry
export interface ApprovalHistoryEntry {
  fromStage: number;
  toStage: number;
  action: ApprovalAction;
  performedBy: Types.ObjectId;
  comments?: string;
  timestamp: Date;
}

//  delegation record
export interface DelegationRecord {
  delegatorId: Types.ObjectId;
  delegateToId: Types.ObjectId;
  workflowTypes: WorkflowType[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

// workflow interface for type safety
export interface DynamicWorkflow {
  _id: Types.ObjectId;
  workflowType: WorkflowType;
  requesterId: Types.ObjectId;
  currentApproverId?: Types.ObjectId;
  status: WorkflowStatus;
  requestData: any;
  workflowDefinitionId: Types.ObjectId;
  approvalChain: ApprovalChainStage[];
  approvalHistory: ApprovalHistoryEntry[];
  currentStage: number;
  totalStages: number;
  escalationReason?: string;
  isEscalated: boolean;
  dueDate?: Date;
  priority: string;
  completedAt?: Date;
  cancellationReason?: string;
  cancelledBy?: Types.ObjectId;
  cancelledAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}