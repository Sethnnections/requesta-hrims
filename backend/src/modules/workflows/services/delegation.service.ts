import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Delegation, DelegationDocument } from '../schemas/delegation.schema';
import { WorkflowType } from '../../../common/enums';

@Injectable()
export class DelegationService {
  private readonly logger = new Logger(DelegationService.name);

  constructor(
    @InjectModel(Delegation.name) private delegationModel: Model<DelegationDocument>,
  ) {}

  /**
   * Create a new delegation
   */
  async createDelegation(createDto: {
    delegatorId: string;
    delegateToId: string;
    workflowTypes: WorkflowType[];
    startDate: Date;
    endDate: Date;
    reason?: string;
    constraints?: any;
  }): Promise<DelegationDocument> {
    const delegation = new this.delegationModel({
      ...createDto,
      delegatorId: new Types.ObjectId(createDto.delegatorId),
      delegateToId: new Types.ObjectId(createDto.delegateToId),
    });

    return await delegation.save();
  }

  /**
   * Find active delegation for an approver and workflow type
   */
  async findActiveDelegation(
    approverId: Types.ObjectId,
    workflowType: WorkflowType
  ): Promise<DelegationDocument | null> {
    const now = new Date();
    
    return await this.delegationModel.findOne({
      delegatorId: approverId,
      workflowTypes: { $in: [workflowType, WorkflowType.ALL] },
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    }).exec();
  }

  /**
   * Get all active delegations for a delegator
   */
  async getActiveDelegations(delegatorId: string): Promise<DelegationDocument[]> {
    const now = new Date();
    
    return await this.delegationModel.find({
      delegatorId: new Types.ObjectId(delegatorId),
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    }).populate('delegateToId', 'firstName lastName employeeNumber gradeCode').exec();
  }

  /**
   * Revoke a delegation
   */
  async revokeDelegation(delegationId: string, revokedBy: string): Promise<DelegationDocument> {
    const delegation = await this.delegationModel.findById(delegationId);
    if (!delegation) {
      throw new Error(`Delegation with ID ${delegationId} not found`);
    }

    delegation.isActive = false;
    delegation.updatedBy = revokedBy;
    
    return await delegation.save();
  }

  /**
   * Check if user has delegated approval rights
   */
  async hasDelegatedApproval(
    delegateToId: string,
    workflowType: WorkflowType
  ): Promise<boolean> {
    const now = new Date();
    
    const count = await this.delegationModel.countDocuments({
      delegateToId: new Types.ObjectId(delegateToId),
      workflowTypes: { $in: [workflowType, WorkflowType.ALL] },
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    });

    return count > 0;
  }

  /**
   * Get delegations where user is a delegate
   */
  async getDelegatedApprovals(delegateToId: string): Promise<DelegationDocument[]> {
    const now = new Date();
    
    return await this.delegationModel.find({
      delegateToId: new Types.ObjectId(delegateToId),
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    }).populate('delegatorId', 'firstName lastName employeeNumber gradeCode').exec();
  }
}