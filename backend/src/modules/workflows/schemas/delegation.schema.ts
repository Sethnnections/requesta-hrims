import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';
import { WorkflowType } from '../../../common/enums';

export type DelegationDocument = Delegation & Document;

@Schema({ timestamps: true, collection: 'delegations' })
export class Delegation extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  delegatorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  delegateToId: Types.ObjectId;

  @Prop({ type: [String], enum: WorkflowType, required: true })
  workflowTypes: WorkflowType[];

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: Object })
  constraints?: any; // Additional constraints for delegation
}

export const DelegationSchema = SchemaFactory.createForClass(Delegation);

// Indexes for efficient queries
DelegationSchema.index({ delegatorId: 1, isActive: 1 });
DelegationSchema.index({ delegateToId: 1 });
DelegationSchema.index({ endDate: 1 });
DelegationSchema.index({ startDate: 1, endDate: 1 });