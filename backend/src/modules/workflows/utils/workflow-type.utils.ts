import { DynamicWorkflowDocument } from '../schemas/dynamic-workflow.schema';
import { DynamicWorkflow } from '../types/workflow.types';

/**
 * Type-safe converter for DynamicWorkflowDocument
 */
export function toEnhancedWorkflow(workflow: DynamicWorkflowDocument): DynamicWorkflow {
  return {
    _id: workflow._id,
    workflowType: workflow.workflowType,
    requesterId: workflow.requesterId,
    currentApproverId: workflow.currentApproverId,
    status: workflow.status,
    requestData: workflow.requestData,
    workflowDefinitionId: workflow.workflowDefinitionId,
    approvalChain: workflow.approvalChain,
    approvalHistory: workflow.approvalHistory,
    currentStage: workflow.currentStage,
    totalStages: workflow.totalStages,
    escalationReason: workflow.escalationReason,
    isEscalated: workflow.isEscalated,
    dueDate: workflow.dueDate,
    priority: workflow.priority,
    completedAt: workflow.completedAt,
    cancellationReason: workflow.cancellationReason,
    cancelledBy: workflow.cancelledBy,
    cancelledAt: workflow.cancelledAt,
    metadata: workflow.metadata,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt
  } as DynamicWorkflow;
}

/**
 * Type guard to check if workflow has enhanced properties
 */
export function isEnhancedWorkflow(workflow: any): workflow is DynamicWorkflow {
  return workflow && 
         'workflowDefinitionId' in workflow && 
         'completedAt' in workflow;
}