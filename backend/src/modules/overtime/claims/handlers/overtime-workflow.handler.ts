import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OvertimeClaim, OvertimeClaimDocument } from '../schemas/overtime-claim.schema';
import { WorkflowStatus , ClaimStatus} from '../../../../common/enums';

@Injectable()
export class OvertimeWorkflowHandler {
  private readonly logger = new Logger(OvertimeWorkflowHandler.name);

  constructor(
    @InjectModel(OvertimeClaim.name)
    private overtimeClaimModel: Model<OvertimeClaimDocument>,
  ) {}

  @OnEvent('workflow.approved')
  async handleWorkflowApproved(payload: any) {
    this.logger.log(`Received workflow approved event: ${JSON.stringify(payload)}`);
    
    if (!payload?.requestData?.claimId) {
      this.logger.warn('Missing claimId in workflow approved event');
      return;
    }

    if (payload.workflowType === 'OVERTIME_CLAIM') {
      try {
        // First verify the overtime claim exists
        const existingClaim = await this.overtimeClaimModel.findById(
          payload.requestData.claimId
        );
        
        if (!existingClaim) {
          this.logger.error(`Overtime claim ${payload.requestData.claimId} not found`);
          return;
        }

        const updateData: any = { 
          status: ClaimStatus.APPROVED,
          approvedAt: new Date()
        };

        const result = await this.overtimeClaimModel.findByIdAndUpdate(
          payload.requestData.claimId,
          updateData,
          { new: true }
        );

        if (result) {
          this.logger.log(`Overtime claim ${payload.requestData.claimId} approved via workflow`);
        } else {
          this.logger.error(`Failed to update overtime claim ${payload.requestData.claimId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update overtime claim status: ${error.message}`);
      }
    }
  }

  @OnEvent('workflow.rejected')
  async handleWorkflowRejected(payload: any) {
    this.logger.log(`Received workflow rejected event: ${JSON.stringify(payload)}`);
    
    if (!payload?.requestData?.claimId) {
      this.logger.warn('Missing claimId in workflow rejected event');
      return;
    }

    if (payload.workflowType === 'OVERTIME_CLAIM') {
      try {
        // Verify existence first
        const existingClaim = await this.overtimeClaimModel.findById(
          payload.requestData.claimId
        );
        
        if (!existingClaim) {
          this.logger.error(`Overtime claim ${payload.requestData.claimId} not found`);
          return;
        }

        const result = await this.overtimeClaimModel.findByIdAndUpdate(
          payload.requestData.claimId,
          {
            status: ClaimStatus.REJECTED,
            rejectionReason: payload.rejectionReason || 'Rejected by workflow'
          },
          { new: true }
        );

        if (result) {
          this.logger.log(`Overtime claim ${payload.requestData.claimId} rejected via workflow`);
        } else {
          this.logger.error(`Failed to update overtime claim ${payload.requestData.claimId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update overtime claim status: ${error.message}`);
      }
    }
  }

  @OnEvent('workflow.cancelled')
  async handleWorkflowCancelled(payload: any) {
    if (!payload?.requestData?.claimId) {
      this.logger.warn('Missing claimId in workflow cancelled event');
      return;
    }

    if (payload.workflowType === 'OVERTIME_CLAIM') {
      try {
        const existingClaim = await this.overtimeClaimModel.findById(
          payload.requestData.claimId
        );
        
        if (!existingClaim) {
          this.logger.error(`Overtime claim ${payload.requestData.claimId} not found`);
          return;
        }

        const result = await this.overtimeClaimModel.findByIdAndUpdate(
          payload.requestData.claimId,
          {
            status: ClaimStatus.CANCELLED,
            rejectionReason: payload.cancellationReason || 'Cancelled by workflow'
          },
          { new: true }
        );

        if (result) {
          this.logger.log(`Overtime claim ${payload.requestData.claimId} cancelled via workflow`);
        } else {
          this.logger.error(`Failed to update overtime claim ${payload.requestData.claimId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update overtime claim status: ${error.message}`);
      }
    }  
  }

  @OnEvent('workflow.escalated')
  async handleWorkflowEscalated(payload: any) {
    this.logger.log(`Received workflow escalated event for overtime claim: ${payload.requestData?.claimId}`);
    
    if (payload.workflowType === 'OVERTIME_CLAIM' && payload.requestData?.claimId) {
      // Handle escalation (e.g., notify higher authorities, update priority)
      this.logger.warn(`Overtime claim ${payload.requestData.claimId} escalated: ${payload.escalationReason}`);
      
      // You could update claim priority or send notifications here
    }
  }
}