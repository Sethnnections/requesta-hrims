import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type WorkflowContextDocument = WorkflowContext & Document;

@Schema({ timestamps: true, collection: 'workflow_contexts' })
export class WorkflowContext extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'DynamicWorkflow', required: true })
  workflowId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  employeeGrade: string;

  @Prop({ type: Number, required: true })
  employeeGradeLevel: number;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  supervisorId?: Types.ObjectId;

  @Prop({ type: String })
  supervisorGrade?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  departmentManagerId?: Types.ObjectId;

  @Prop({ type: Object })
  workflowData: any; 

  @Prop({ type: Object })
  calculatedChain: any; 

  @Prop({ type: Boolean, default: false })
  isChainBuilt: boolean;
}

export const WorkflowContextSchema = SchemaFactory.createForClass(WorkflowContext);

// Indexes
WorkflowContextSchema.index({ workflowId: 1 });
WorkflowContextSchema.index({ employeeId: 1 });