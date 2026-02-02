/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WorkflowType } from '../../../../common/enums';

export type GradeApprovalConfigDocument = GradeApprovalConfig & Document;

@Schema({ timestamps: true, collection: 'grade_approval_configs' })
export class GradeApprovalConfig {
  @Prop({ required: true, unique: true })
  gradeCode: string;

  @Prop({ required: true })
  maxApprovalLevel: string; // Reference to gradeCode

  @Prop({
    type: Map,
    of: String,
    default: () => new Map(),
  })
  workflowTypeOverrides: Map<WorkflowType, string>;

  @Prop({
    type: [
      {
        threshold: { type: Number, required: true },
        requiredApprovalLevel: { type: String, required: true },
        description: String,
      },
    ],
    default: [],
  })
  amountThresholds: Array<{
    threshold: number;
    requiredApprovalLevel: string;
    description?: string;
  }>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const GradeApprovalConfigSchema =
  SchemaFactory.createForClass(GradeApprovalConfig);

// Indexes
GradeApprovalConfigSchema.index({ gradeCode: 1, isActive: 1 });
GradeApprovalConfigSchema.index({ isActive: 1 });
