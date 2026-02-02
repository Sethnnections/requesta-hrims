import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';
import { WorkflowType, WorkflowStatus, ApprovalAction } from '../../../common/enums';

export type DynamicWorkflowDocument = DynamicWorkflow & Document;

@Schema({ timestamps: true, collection: 'dynamic_workflows' })
export class DynamicWorkflow extends BaseSchema {
  @Prop({ type: String, enum: WorkflowType, required: true })
  workflowType: WorkflowType;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requesterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  currentApproverId?: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: WorkflowStatus, 
    default: WorkflowStatus.DRAFT 
  })
  status: WorkflowStatus;

  @Prop({ type: Object, required: true })
  requestData: any;

  // : Reference to workflow definition
  @Prop({ type: Types.ObjectId, ref: 'WorkflowDefinition', required: true })
  workflowDefinitionId: Types.ObjectId;

  @Prop({ type: [{
    approverId: { type: Types.ObjectId, ref: 'Employee' },
    approverGrade: { type: String },
    stage: { type: Number },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELEGATED'], default: 'PENDING' },
    action: { type: String, enum: ApprovalAction },
    comments: { type: String },
    actionDate: { type: Date },
    delegatedTo: { type: Types.ObjectId, ref: 'Employee' }
  }], default: [] })
  approvalChain: any[];

  @Prop({ type: [{
    fromStage: { type: Number },
    toStage: { type: Number },
    action: { type: String, enum: ApprovalAction },
    performedBy: { type: Types.ObjectId, ref: 'Employee' },
    comments: { type: String },
    timestamp: { type: Date, default: Date.now }
  }], default: [] })
  approvalHistory: any[];

  @Prop({ type: Number, default: 0 })
  currentStage: number;

  @Prop({ type: Number, default: 0 })
  totalStages: number;

  @Prop({ type: String })
  escalationReason?: string;

  @Prop({ type: Boolean, default: false })
  isEscalated: boolean;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: String, default: 'NORMAL' })
  priority: string;

  // : Completion timestamp
  @Prop({ type: Date })
  completedAt?: Date;

  // : Cancellation fields
  @Prop({ type: String })
  cancellationReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  cancelledBy?: Types.ObjectId;

  @Prop({ type: Date })
  cancelledAt?: Date;

  // : Additional metadata
  @Prop({ type: Object })
  metadata?: any;
}

export const DynamicWorkflowSchema = SchemaFactory.createForClass(DynamicWorkflow);

// Indexes
DynamicWorkflowSchema.index({ requesterId: 1 });
DynamicWorkflowSchema.index({ currentApproverId: 1 });
DynamicWorkflowSchema.index({ workflowType: 1, status: 1 });
DynamicWorkflowSchema.index({ status: 1 });
DynamicWorkflowSchema.index({ dueDate: 1 });
DynamicWorkflowSchema.index({ workflowDefinitionId: 1 }); // 
DynamicWorkflowSchema.index({ completedAt: 1 });