// workflow-instances.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DynamicWorkflow, DynamicWorkflowDocument } from '../schemas/dynamic-workflow.schema';
import { DynamicWorkflowEngineService } from '../services/dynamic-workflow-engine.service';
import { DelegationService } from '../services/delegation.service';
import { WorkflowType, WorkflowStatus, ApprovalAction } from '../../../common/enums';

@Injectable()
export class WorkflowInstancesService {
  private readonly logger = new Logger(WorkflowInstancesService.name);

  constructor(
    @InjectModel(DynamicWorkflow.name) 
    private readonly workflowModel: Model<DynamicWorkflowDocument>,
    private readonly dynamicWorkflowEngine: DynamicWorkflowEngineService,
    private readonly delegationService: DelegationService,
  ) {}

  /**
   * Create a new workflow instance using dynamic engine
   */
  async createWorkflowInstance(createDto: {
    workflowType: WorkflowType;
    requesterId: string;
    requestData: any;
  }) {
    this.logger.log(`Creating workflow instance for ${createDto.workflowType}`);

    return await this.dynamicWorkflowEngine.createWorkflow(
      createDto.workflowType,
      createDto.requesterId,
      createDto.requestData
    );
  }

  /**
   * Process approval for workflow instance
   */
  async processApproval(
    workflowId: string,
    approverId: string,
    action: ApprovalAction,
    comments?: string
  ) {
    return await this.dynamicWorkflowEngine.processApproval(
      workflowId,
      approverId,
      action,
      comments
    );
  }

  /**
   * Process delegation for workflow instance
   */
  async processDelegation(
    workflowId: string,
    approverId: string,
    delegateToId: string,
    comments?: string
  ) {
    return await this.dynamicWorkflowEngine.processDelegation(
      workflowId,
      approverId,
      delegateToId,
      comments
    );
  }

  /**
   * Get workflow instances for user
   */
  async getWorkflowInstancesForUser(userId: string, filters: any = {}) {
    const query: any = {};

    if (filters.initiatedByMe) {
      query.requesterId = new Types.ObjectId(userId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.workflowType) {
      query.workflowType = filters.workflowType;
    }

    return this.workflowModel
      .find(query)
      .populate('requesterId', 'firstName lastName employeeNumber gradeCode departmentId')
      .populate('currentApproverId', 'firstName lastName employeeNumber gradeCode')
      .populate('approvalChain.approverId', 'firstName lastName employeeNumber gradeCode')
      .populate('approvalChain.delegatedTo', 'firstName lastName employeeNumber gradeCode')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get pending approvals for user (both direct and delegated)
   */
  async getPendingApprovals(approverId: string) {
    const directApprovals = await this.dynamicWorkflowEngine.getPendingApprovals(approverId);
    const delegatedApprovals = await this.dynamicWorkflowEngine.getDelegatedApprovals(approverId);
    
    return [...directApprovals, ...delegatedApprovals];
  }

  /**
   * Get workflow instance by ID
   */
  async getWorkflowInstanceById(id: string) {
    const instance = await this.workflowModel
      .findById(id)
      .populate('requesterId', 'firstName lastName employeeNumber gradeCode departmentId')
      .populate('currentApproverId', 'firstName lastName employeeNumber gradeCode')
      .populate('approvalChain.approverId', 'firstName lastName employeeNumber gradeCode')
      .populate('approvalChain.delegatedTo', 'firstName lastName employeeNumber gradeCode')
      .exec();

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    return instance;
  }

  /**
   * Cancel workflow instance
   */
  async cancelWorkflowInstance(workflowId: string, cancelledBy: string, reason: string) {
    const workflow = await this.workflowModel.findById(workflowId);
    
    if (!workflow) {
      throw new NotFoundException('Workflow instance not found');
    }

    workflow.status = WorkflowStatus.CANCELLED;
    workflow.escalationReason = reason;

    await workflow.save();

    this.logger.log(`Workflow instance ${workflowId} cancelled by ${cancelledBy}`);
    
    return workflow;
  }

  // Delegation management methods
  async createDelegation(createDto: {
    delegatorId: string;
    delegateToId: string;
    workflowTypes: WorkflowType[];
    startDate: Date;
    endDate: Date;
    reason?: string;
    constraints?: any;
  }) {
    return await this.delegationService.createDelegation(createDto);
  }

  async getActiveDelegations(delegatorId: string) {
    return await this.delegationService.getActiveDelegations(delegatorId);
  }

  async revokeDelegation(delegationId: string, revokedBy: string) {
    return await this.delegationService.revokeDelegation(delegationId, revokedBy);
  }
}