import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WorkflowStatus } from '../../../../common/enums';

export type LoanApplicationDocument = LoanApplication & Document;

@Schema({ timestamps: true })
export class LoanApplication {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  loanType: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'MWK' })
  currency: string;

  @Prop({ required: true })
  purpose: string;

  @Prop({ required: true })
  repaymentPeriod: number; // in months

  @Prop({ required: true })
  monthlyRepayment: number;

  @Prop({ required: true })
  interestRate: number;

  @Prop({ required: true })
  totalRepayment: number;

  @Prop()
  supportingDocuments?: string[]; // URLs to uploaded documents

  @Prop({ type: Types.ObjectId, ref: 'DynamicWorkflow' })
  workflowId?: Types.ObjectId;

  @Prop({ enum: WorkflowStatus, default: WorkflowStatus.DRAFT })
  status: WorkflowStatus;

  @Prop()
  approvedAmount?: number;

  @Prop()
  approvedInterestRate?: number;

  @Prop()
  approvedRepaymentPeriod?: number;

  @Prop()
  approvalDate?: Date;

  @Prop()
  disbursementDate?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Object })
  metadata?: any;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const LoanApplicationSchema =
  SchemaFactory.createForClass(LoanApplication);

LoanApplicationSchema.index({ employeeId: 1, status: 1 });
LoanApplicationSchema.index({ workflowId: 1 });
LoanApplicationSchema.index({ status: 1, createdAt: -1 });
LoanApplicationSchema.index({ loanType: 1, status: 1 });
LoanApplicationSchema.index({ createdAt: -1 });
