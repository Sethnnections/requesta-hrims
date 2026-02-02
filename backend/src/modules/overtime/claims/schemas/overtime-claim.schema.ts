import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OvertimeType, ClaimStatus } from '../../../../common/enums';

export type OvertimeClaimDocument = OvertimeClaim & Document;

@Schema({ timestamps: true, collection: 'overtime_claims' })
export class OvertimeClaim {
  @Prop({ required: true, unique: true })
  claimReference: string; // OVT-YYYY-MM-0001 format

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  claimDate: Date;

  @Prop({ type: String, enum: Object.values(OvertimeType), required: true })
  overtimeType: OvertimeType;

  @Prop({
    type: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      totalHours: { type: Number, required: true },
      breakHours: { type: Number, default: 0 },
    },
    required: true,
  })
  workingHours: {
    startTime: Date;
    endTime: Date;
    totalHours: number;
    breakHours: number;
  };

  @Prop({ required: true })
  reason: string;

  @Prop()
  projectCode?: string;

  @Prop()
  taskReference?: string;

  @Prop()
  clientName?: string;

  @Prop({ default: false })
  supervisorConfirmed: boolean;

  @Prop()
  supervisorConfirmationDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  confirmedBy?: Types.ObjectId;

  @Prop({
    type: {
      basicHourlyRate: Number,
      overtimeRate: Number,
      overtimeMultiplier: Number,
      totalAmount: Number,
      calculatedHours: Number,
      gradeMultiplier: Number,
    },
  })
  calculatedPayments?: {
    basicHourlyRate: number;
    overtimeRate: number;
    overtimeMultiplier: number;
    totalAmount: number;
    calculatedHours: number;
    gradeMultiplier: number;
  };

  @Prop({
    type: {
      isAutoApproved: { type: Boolean, default: false },
      autoApprovalReason: String,
      requiresManagerApproval: { type: Boolean, default: true },
      requiresHrApproval: { type: Boolean, default: false },
      requiresFinanceApproval: { type: Boolean, default: false },
    },
  })
  approvalRules?: {
    isAutoApproved: boolean;
    autoApprovalReason?: string;
    requiresManagerApproval: boolean;
    requiresHrApproval: boolean;
    requiresFinanceApproval: boolean;
  };

  @Prop({
    type: String,
    enum: Object.values(ClaimStatus),
    default: ClaimStatus.DRAFT,
  })
  status: ClaimStatus;

  @Prop({ type: Types.ObjectId, ref: 'DynamicWorkflow' })
  workflowId?: Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop()
  approvedAt?: Date;

  @Prop()
  processedAt?: Date;

  @Prop()
  paidAt?: Date;

  @Prop()
  payrollPeriod?: string; // YYYY-MM format

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop()
  comments?: string;

  @Prop({ type: [String], default: [] })
  supportingDocuments?: string[]; // URLs to timesheets, approvals, etc.

  @Prop({ type: Object })
  metadata?: any;
}

export const OvertimeClaimSchema = SchemaFactory.createForClass(OvertimeClaim);

// Indexes
OvertimeClaimSchema.index({ employeeId: 1, status: 1 });
OvertimeClaimSchema.index({ workflowId: 1 });
OvertimeClaimSchema.index({ status: 1, createdAt: -1 });
OvertimeClaimSchema.index({ overtimeType: 1, status: 1 });
OvertimeClaimSchema.index({ claimDate: 1 });
OvertimeClaimSchema.index({
  'workingHours.startTime': 1,
  'workingHours.endTime': 1,
});
OvertimeClaimSchema.index({ supervisorConfirmed: 1 });
OvertimeClaimSchema.index({ createdAt: -1 });
OvertimeClaimSchema.index({ payrollPeriod: 1, status: 1 });
