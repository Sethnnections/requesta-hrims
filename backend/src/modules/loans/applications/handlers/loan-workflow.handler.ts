import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoanApplication, LoanApplicationDocument } from '../schemas/loan-application.schema';
import { WorkflowStatus } from '../../../../common/enums';

@Injectable()
export class LoanWorkflowHandler {
  private readonly logger = new Logger(LoanWorkflowHandler.name);

  constructor(
    @InjectModel(LoanApplication.name)
    private loanApplicationModel: Model<LoanApplicationDocument>,
  ) {}

  @OnEvent('workflow.approved')
  async handleWorkflowApproved(payload: any) {
    this.logger.log(`Received workflow approved event: ${JSON.stringify(payload)}`);
    
    if (!payload?.requestData?.loanApplicationId) {
      this.logger.warn('Missing loanApplicationId in workflow approved event');
      return;
    }

    if (payload.workflowType === 'LOAN_APPLICATION') {
      try {
        // First verify the loan application exists
        const existingApplication = await this.loanApplicationModel.findById(
          payload.requestData.loanApplicationId
        );
        
        if (!existingApplication) {
          this.logger.error(`Loan application ${payload.requestData.loanApplicationId} not found`);
          return;
        }

        const updateData: any = { 
          status: WorkflowStatus.APPROVED,
          approvalDate: new Date()
        };

        // Add approved amounts if provided
        if (payload.approvedAmount !== undefined) updateData.approvedAmount = payload.approvedAmount;
        if (payload.approvedInterestRate !== undefined) updateData.approvedInterestRate = payload.approvedInterestRate;
        if (payload.approvedRepaymentPeriod !== undefined) updateData.approvedRepaymentPeriod = payload.approvedRepaymentPeriod;

        const result = await this.loanApplicationModel.findByIdAndUpdate(
          payload.requestData.loanApplicationId,
          updateData,
          { new: true }
        );

        if (result) {
          this.logger.log(`Loan application ${payload.requestData.loanApplicationId} approved via workflow`);
        } else {
          this.logger.error(`Failed to update loan application ${payload.requestData.loanApplicationId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update loan application status: ${error.message}`);
      }
    }
  }

  @OnEvent('workflow.rejected')
  async handleWorkflowRejected(payload: any) {
    this.logger.log(`Received workflow rejected event: ${JSON.stringify(payload)}`);
    
    if (!payload?.requestData?.loanApplicationId) {
      this.logger.warn('Missing loanApplicationId in workflow rejected event');
      return;
    }

    if (payload.workflowType === 'LOAN_APPLICATION') {
      try {
        // Verify existence first
        const existingApplication = await this.loanApplicationModel.findById(
          payload.requestData.loanApplicationId
        );
        
        if (!existingApplication) {
          this.logger.error(`Loan application ${payload.requestData.loanApplicationId} not found`);
          return;
        }

        const result = await this.loanApplicationModel.findByIdAndUpdate(
          payload.requestData.loanApplicationId,
          {
            status: WorkflowStatus.REJECTED,
            rejectionReason: payload.rejectionReason || 'Rejected by workflow'
          },
          { new: true }
        );

        if (result) {
          this.logger.log(`Loan application ${payload.requestData.loanApplicationId} rejected via workflow`);
        } else {
          this.logger.error(`Failed to update loan application ${payload.requestData.loanApplicationId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update loan application status: ${error.message}`);
      }
    }
  }

  @OnEvent('workflow.cancelled')
  async handleWorkflowCancelled(payload: any) {
    if (!payload?.requestData?.loanApplicationId) {
      this.logger.warn('Missing loanApplicationId in workflow cancelled event');
      return;
    }

    if (payload.workflowType === 'LOAN_APPLICATION') {
      try {
        const existingApplication = await this.loanApplicationModel.findById(
          payload.requestData.loanApplicationId
        );
        
        if (!existingApplication) {
          this.logger.error(`Loan application ${payload.requestData.loanApplicationId} not found`);
          return;
        }

        const result = await this.loanApplicationModel.findByIdAndUpdate(
          payload.requestData.loanApplicationId,
          {
            status: WorkflowStatus.CANCELLED,
            rejectionReason: payload.cancellationReason || 'Cancelled by workflow'
          },
          { new: true }
        );

        if (result) {

          this.logger.log(`Loan application ${payload.requestData.loanApplicationId} cancelled via workflow`);

        } else {

          this.logger.error(`Failed to update loan application ${payload.requestData.loanApplicationId}`);

        }
      } catch (error) {

          this.logger.error(`Failed to update loan application status: ${error.message}`);
          
      }
    }  
  }
}