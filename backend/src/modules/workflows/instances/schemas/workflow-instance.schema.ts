import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { WorkflowStatus, ApprovalAction, EntityType, WorkflowType } from '../../../../common/enums';

export type WorkflowInstanceDocument = WorkflowInstance & Document;

@Schema({ timestamps: true, collection: 'workflow_instances' })
export class WorkflowInstance {
  @ApiProperty({ description: 'Workflow definition ID' })
  @Prop({ type: Types.ObjectId, ref: 'WorkflowDefinition', required: true })
  workflowDefinitionId: Types.ObjectId;

  @ApiProperty({ enum: WorkflowType, description: 'Type of workflow' })
  @Prop({ type: String, enum: Object.values(WorkflowType), required: true })
  workflowType: WorkflowType;

  @ApiProperty({ enum: WorkflowStatus, description: 'Current status of workflow' })
  @Prop({ type: String, enum: Object.values(WorkflowStatus), default: WorkflowStatus.SUBMITTED })
  status: WorkflowStatus;

  @ApiProperty({ description: 'User who initiated the workflow' })
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  initiatedBy: Types.ObjectId;

  @ApiProperty({ enum: EntityType, description: 'Type of entity' })
  @Prop({ type: String, enum: Object.values(EntityType), required: true })
  entityType: EntityType;

  @ApiProperty({ description: 'ID of the entity' })
  @Prop({ required: true })
  entityId: string;

  @ApiProperty({ description: 'Current state of entity data' })
  @Prop({ type: Object })
  currentData: any;

  @ApiProperty({ description: 'Original data when workflow started' })
  @Prop({ type: Object })
  initialData: any;

  @ApiProperty({ description: 'Current stage number' })
  @Prop({ default: 0 })
  currentStage: number;

  @ApiProperty({ description: 'Total number of stages' })
  @Prop()
  totalStages: number;

  @ApiProperty({ description: 'Current approvers for this stage' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Employee' }] })
  currentApprovers: Types.ObjectId[];

  @ApiProperty({ 
    description: 'Approval log with history of all actions',
    type: [Object] 
  })
  @Prop({ type: [{
    stage: Number,
    approverId: { type: Types.ObjectId, ref: 'Employee' },
    action: { type: String, enum: Object.values(ApprovalAction) },
    comments: String,
    timestamp: { type: Date, default: Date.now },
    delegatedTo: { type: Types.ObjectId, ref: 'Employee' },
    dataSnapshot: Object,
  }]})
  approvalLog: Array<{
    stage: number;
    approverId: Types.ObjectId;
    action: ApprovalAction;
    comments?: string;
    timestamp: Date;
    delegatedTo?: Types.ObjectId;
    dataSnapshot?: any;
  }>;

  @ApiProperty({ description: 'When the workflow was submitted' })
  @Prop()
  submittedAt: Date;

  @ApiProperty({ description: 'When the workflow was completed', required: false })
  @Prop()
  completedAt?: Date;

  @ApiProperty({ description: 'Reason for cancellation', required: false })
  @Prop()
  cancellationReason?: string;

  @ApiProperty({ description: 'Who cancelled the workflow', required: false })
  @Prop()
  cancelledBy?: string;

  @ApiProperty({ description: 'When the workflow was cancelled', required: false })
  @Prop()
  cancelledAt?: Date;

  @ApiProperty({ description: 'Due date for completion', required: false })
  @Prop()
  dueDate?: Date;

  @ApiProperty({ description: 'Priority level (1-5)', required: false })
  @Prop()
  priority: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Prop({ type: Object })
  metadata: any;

  // Auto-timestamps
  @ApiProperty({ description: 'Creation timestamp' })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WorkflowInstanceSchema = SchemaFactory.createForClass(WorkflowInstance);

// Indexes
WorkflowInstanceSchema.index({ entityType: 1, entityId: 1 });
WorkflowInstanceSchema.index({ status: 1 });
WorkflowInstanceSchema.index({ initiatedBy: 1 });
WorkflowInstanceSchema.index({ workflowDefinitionId: 1 });
WorkflowInstanceSchema.index({ workflowType: 1 });
WorkflowInstanceSchema.index({ dueDate: 1 });
WorkflowInstanceSchema.index({ createdAt: 1 });