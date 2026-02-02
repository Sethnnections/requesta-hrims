import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelRequest, TravelRequestDocument } from '../schemas/travel-request.schema';
import { TravelStatus } from '../../../../common/enums';

@Injectable()
export class TravelWorkflowHandler {
  private readonly logger = new Logger(TravelWorkflowHandler.name);

  constructor(
    @InjectModel(TravelRequest.name)
    private travelRequestModel: Model<TravelRequestDocument>,
  ) {}

  @OnEvent('workflow.approved')
  async handleWorkflowApproved(payload: any) {
    this.logger.log(`Received workflow approved event: ${JSON.stringify(payload)}`);
    
    if (!payload?.requestData?.travelRequestId) {
      this.logger.warn('Missing travelRequestId in workflow approved event');
      return;
    }

    if (payload.workflowType === 'TRAVEL_REQUEST') {
      try {
        // First verify the travel request exists
        const existingRequest = await this.travelRequestModel.findById(
          payload.requestData.travelRequestId
        );
        
        if (!existingRequest) {
          this.logger.error(`Travel request ${payload.requestData.travelRequestId} not found`);
          return;
        }

        const updateData: any = { 
          status: TravelStatus.APPROVED,
          approvedAt: new Date()
        };

        const result = await this.travelRequestModel.findByIdAndUpdate(
          payload.requestData.travelRequestId,
          updateData,
          { new: true }
        );

        if (result) {
          this.logger.log(`Travel request ${payload.requestData.travelRequestId} approved via workflow`);
        } else {
          this.logger.error(`Failed to update travel request ${payload.requestData.travelRequestId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update travel request status: ${error.message}`);
      }
    }
  }

  @OnEvent('workflow.rejected')
  async handleWorkflowRejected(payload: any) {
    this.logger.log(`Received workflow rejected event: ${JSON.stringify(payload)}`);
    
    if (!payload?.requestData?.travelRequestId) {
      this.logger.warn('Missing travelRequestId in workflow rejected event');
      return;
    }

    if (payload.workflowType === 'TRAVEL_REQUEST') {
      try {
        // Verify existence first
        const existingRequest = await this.travelRequestModel.findById(
          payload.requestData.travelRequestId
        );
        
        if (!existingRequest) {
          this.logger.error(`Travel request ${payload.requestData.travelRequestId} not found`);
          return;
        }

        const result = await this.travelRequestModel.findByIdAndUpdate(
          payload.requestData.travelRequestId,
          {
            status: TravelStatus.REJECTED,
            rejectionReason: payload.rejectionReason || 'Rejected by workflow'
          },
          { new: true }
        );

        if (result) {
          this.logger.log(`Travel request ${payload.requestData.travelRequestId} rejected via workflow`);
        } else {
          this.logger.error(`Failed to update travel request ${payload.requestData.travelRequestId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update travel request status: ${error.message}`);
      }
    }
  }

  @OnEvent('workflow.cancelled')
  async handleWorkflowCancelled(payload: any) {
    if (!payload?.requestData?.travelRequestId) {
      this.logger.warn('Missing travelRequestId in workflow cancelled event');
      return;
    }

    if (payload.workflowType === 'TRAVEL_REQUEST') {
      try {
        const existingRequest = await this.travelRequestModel.findById(
          payload.requestData.travelRequestId
        );
        
        if (!existingRequest) {
          this.logger.error(`Travel request ${payload.requestData.travelRequestId} not found`);
          return;
        }

        const result = await this.travelRequestModel.findByIdAndUpdate(
          payload.requestData.travelRequestId,
          {
            status: TravelStatus.CANCELLED,
            rejectionReason: payload.cancellationReason || 'Cancelled by workflow'
          },
          { new: true }
        );

        if (result) {
          this.logger.log(`Travel request ${payload.requestData.travelRequestId} cancelled via workflow`);
        } else {
          this.logger.error(`Failed to update travel request ${payload.requestData.travelRequestId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update travel request status: ${error.message}`);
      }
    }  
  }
}