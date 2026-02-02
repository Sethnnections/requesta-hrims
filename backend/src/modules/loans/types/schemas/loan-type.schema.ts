import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoanTypeDocument = LoanType & Document;

@Schema({ timestamps: true })
export class LoanType {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  minAmount: number;

  @Prop({ required: true })
  maxAmount: number;

  @Prop({ required: true })
  minRepaymentPeriod: number; // in months

  @Prop({ required: true })
  maxRepaymentPeriod: number; // in months

  @Prop({ required: true })
  interestRate: number;

  @Prop({ required: true })
  processingFee: number;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: [String] })
  eligibleGrades: string[]; // Grade codes that can apply

  @Prop({ type: [String] })
  requiredDocuments: string[]; // List of required document types

  @Prop({ type: Object })
  termsAndConditions?: any;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const LoanTypeSchema = SchemaFactory.createForClass(LoanType);

// Add indexes
LoanTypeSchema.index({ isActive: 1 });
