import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApprovalAction } from '../../../../common/enums';

export type ApprovalLogDocument = ApprovalLog & Document;

@Schema({ timestamps: true, collection: 'approval_logs' })
export class ApprovalLog {
  @Prop({ type: Types.ObjectId, ref: 'WorkflowInstance', required: true })
  workflowInstanceId: Types.ObjectId;

  @Prop({ required: true })
  stage: number;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  approverId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(ApprovalAction), required: true })
  action: ApprovalAction;

  @Prop()
  comments?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  delegatedTo?: Types.ObjectId;

  @Prop({ type: Object })
  dataSnapshot: any; // Data state at the time of approval

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ApprovalLogSchema = SchemaFactory.createForClass(ApprovalLog);

// Indexes
ApprovalLogSchema.index({ workflowInstanceId: 1 });
ApprovalLogSchema.index({ approverId: 1 });
ApprovalLogSchema.index({ timestamp: 1 });