import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BaseSchema } from '../../../../common/schemas/base.schema';

export type GradeDocument = Grade & Document;
@Schema({ timestamps: true, collection: 'grades' })
export class Grade extends BaseSchema {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string; // M3, M4, M5, etc.

  @Prop({ required: true })
  level: number; // 1 for M3, 2 for M4, etc.

  @Prop({
    required: true,
    enum: ['JUNIOR', 'OPERATIONAL', 'SUPERVISORY', 'MANAGERIAL', 'EXECUTIVE'],
  })
  band: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: {
      basicSalary: { min: Number, mid: Number, max: Number },
      houseAllowance: { type: Number, default: 0 },
      carAllowance: { type: Number, default: 0 },
      travelAllowance: { type: Number, default: 0 },
      overtimeRate: { type: Number, default: 1.0 }, // Multiplier
    },
    required: true,
  })
  compensation: {
    basicSalary: { min: number; mid: number; max: number };
    houseAllowance: number;
    carAllowance: number;
    travelAllowance: number;
    overtimeRate: number;
  };

  @Prop({
    type: {
      maxLoanAmount: { type: Number, default: 0 },
      requiresManagerApproval: { type: Boolean, default: true },
      requiresDirectorApproval: { type: Boolean, default: false },
      maxApprovalLevel: { type: String, default: 'M11' }, // Maximum grade this grade can approve up to
    },
  })
  limits: {
    maxLoanAmount: number;
    requiresManagerApproval: boolean;
    requiresDirectorApproval: boolean;
    maxApprovalLevel: string;
  };

  @Prop({ default: true })
  isActive: boolean = true;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Grade', required: false })
  nextGrade?: string; // Reference to next grade in progression
}

export const GradeSchema = SchemaFactory.createForClass(Grade);
