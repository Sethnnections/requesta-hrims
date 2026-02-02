import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OvertimeType} from '../../../../common/enums';

export type OvertimeRateConfigDocument = OvertimeRateConfig & Document;

@Schema({ timestamps: true, collection: 'overtime_rate_configs' })
export class OvertimeRateConfig {
  @Prop({ required: true })
  gradeCode: string; // M3, M4, M5, etc.

  @Prop({ type: String, enum: Object.values(OvertimeType), required: true })
  overtimeType: OvertimeType;

  @Prop({ required: true, default: 1.0 })
  baseMultiplier: number; // Base rate multiplier

  @Prop({ required: true, default: 0 })
  minimumHours: number; // Minimum hours before overtime applies

  @Prop({ required: true, default: 0 })
  maximumHoursPerDay: number; // Maximum overtime hours allowed per day

  @Prop({ required: true, default: 0 })
  maximumHoursPerMonth: number; // Maximum overtime hours allowed per month

  @Prop({
    type: {
      autoApproveLimit: { type: Number, default: 2 }, // Auto-approve if hours < this
      requiresManagerApproval: { type: Boolean, default: true },
      requiresDirectorApproval: { type: Boolean, default: false },
      requiresHrApproval: { type: Boolean, default: false },
      notificationThreshold: { type: Number, default: 10 } // Notify if hours exceed this
    }
  })
  approvalRules: {
    autoApproveLimit: number;
    requiresManagerApproval: boolean;
    requiresDirectorApproval: boolean;
    requiresHrApproval: boolean;
    notificationThreshold: number;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  effectiveFrom: Date;

  @Prop()
  effectiveTo?: Date;

  @Prop()
  description?: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy?: string;
}

export const OvertimeRateConfigSchema = SchemaFactory.createForClass(OvertimeRateConfig);

// Indexes
OvertimeRateConfigSchema.index({ gradeCode: 1, overtimeType: 1, isActive: 1 });
OvertimeRateConfigSchema.index({ isActive: 1 });
OvertimeRateConfigSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
OvertimeRateConfigSchema.index({ gradeCode: 1, isActive: 1 });