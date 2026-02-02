import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WorkflowType, ApprovalRuleType } from '../../../common/enums';

export type StageResolverDocument = StageResolver & Document;

@Schema({ timestamps: true, collection: 'stage_resolvers' })
export class StageResolver {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: WorkflowType, required: true })
  workflowType: WorkflowType;

  @Prop({ required: true })
  stageNumber: number;

  @Prop({ type: String, enum: ApprovalRuleType, required: true })
  approvalRuleType: ApprovalRuleType;

  @Prop({ type: Object, required: true })
  ruleConfig: any;

  @Prop({ 
    type: [{
      conditionType: { type: String, required: true },
      field: String,
      operator: String,
      value: Object, // ✅ Clean and simple
      thenAction: String
    }],
    default: []
  })
  conditions: Array<{
    conditionType: string;
    field?: string;
    operator?: string;
    value?: any;
    thenAction: string;
  }>;

  @Prop({ default: 1 })
  executionOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const StageResolverSchema = SchemaFactory.createForClass(StageResolver);

// Indexes
StageResolverSchema.index({ workflowType: 1, stageNumber: 1, isActive: 1 });
StageResolverSchema.index({ isActive: 1 });