import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StageType, ApprovalRuleType } from '../../../../common/enums';

export type WorkflowStageDocument = WorkflowStage & Document;

@Schema({ timestamps: true, collection: 'workflow_stages' })
export class WorkflowStage {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: Object.values(StageType), required: true })
  stageType: StageType;

  @Prop({ required: true })
  order: number;

  @Prop({ type: String, enum: Object.values(ApprovalRuleType) })
  approvalRuleType?: ApprovalRuleType;

  // Rule-specific configurations
  @Prop()
  requiredApprovals?: number; // For multiple approvers

  @Prop()
  managerialLevel?: number; // 1 = immediate supervisor, 2 = supervisor's supervisor, etc.

  @Prop()
  minimumGrade?: string; // Minimum grade required for approval

  @Prop({ type: [String] })
  requiredRoles?: string[]; // Specific roles that can approve

  @Prop()
  amountThreshold?: number; // For amount-based approvals

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  specificUserId?: Types.ObjectId; // For specific user approvals

  @Prop()
  autoApproveAfter?: number; // Auto-approve after X hours

  @Prop({ default: false })
  isMandatory: boolean; // Whether this stage can be skipped

  @Prop()
  escalationUserId?: Types.ObjectId; // User to escalate to if timeout

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy: string;

  // Auto-timestamps
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WorkflowStageSchema = SchemaFactory.createForClass(WorkflowStage);

// Indexes
WorkflowStageSchema.index({ order: 1 });
WorkflowStageSchema.index({ stageType: 1 });
WorkflowStageSchema.index({ isActive: 1 });