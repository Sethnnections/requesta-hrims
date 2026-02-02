import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../../common/schemas/base.schema';
import { WorkflowType } from '../../../../common/enums';

export type WorkflowDefinitionDocument = WorkflowDefinition & Document;

@Schema({ timestamps: true, collection: 'workflow_definitions' })
export class WorkflowDefinition extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: WorkflowType, required: true })
  workflowType: WorkflowType;

  @Prop({ type: String, required: true })
  department: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: [{
      stage: { type: Number, required: true },
      name: { type: String, required: true },
      approvalRule: { type: String, required: true },
      ruleConfig: { type: Object }
    }],
    default: []
  })
  stages: Array<{
    stage: number;
    name: string;
    approvalRule: string;
    ruleConfig?: any;
  }>;

  @Prop({ type: Number, default: 1 })
  version: number;
}

export const WorkflowDefinitionSchema = SchemaFactory.createForClass(WorkflowDefinition);

// Indexes
WorkflowDefinitionSchema.index({ workflowType: 1, department: 1, isActive: 1 });
WorkflowDefinitionSchema.index({ isActive: 1 });