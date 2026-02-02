import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RepaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
}

export type LoanRepaymentDocument = LoanRepayment & Document;

@Schema({ timestamps: true })
export class LoanRepayment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'LoanApplication' })
  loanApplicationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  installmentNumber: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  amountDue: number;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ enum: RepaymentStatus, default: RepaymentStatus.PENDING })
  status: RepaymentStatus;

  @Prop()
  paymentDate?: Date;

  @Prop()
  paymentReference?: string;

  @Prop()
  lateFee?: number;

  @Prop()
  remarks?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: any;
}

export const LoanRepaymentSchema = SchemaFactory.createForClass(LoanRepayment);

// Add indexes
LoanRepaymentSchema.index({ loanApplicationId: 1, installmentNumber: 1 });
LoanRepaymentSchema.index({ employeeId: 1, status: 1 });
LoanRepaymentSchema.index({ dueDate: 1, status: 1 });
