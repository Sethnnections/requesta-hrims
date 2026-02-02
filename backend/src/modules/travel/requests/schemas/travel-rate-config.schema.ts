/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TravelType, Currency } from '../../../../common/enums';

export type TravelRateConfigDocument = TravelRateConfig & Document;

@Schema({ timestamps: true, collection: 'travel_rate_configs' })
export class TravelRateConfig {
  @Prop({ required: true })
  gradeCode: string; // M3, M4, M5, etc.

  @Prop({ type: String, enum: Object.values(TravelType), required: true })
  travelType: TravelType;

  @Prop({ required: true, default: Currency.MWK })
  currency: Currency;

  @Prop({ required: true, default: 0 })
  perDiemRate: number; // Daily allowance

  @Prop({ required: true, default: 0 })
  accommodationRate: number; // Max per night

  @Prop({ required: true, default: 0 })
  transportRate: number; // Transport allowance

  @Prop({ required: true, default: 0 })
  communicationRate: number; // Communication allowance

  @Prop({ required: true, default: 0 })
  incidentalsRate: number; // Incidentals allowance

  @Prop({
    type: {
      maxDays: { type: Number, default: 30 },
      advancePercentage: { type: Number, default: 80 },
      requiresDirectorApproval: { type: Boolean, default: false },
    },
  })
  limits: {
    maxDays: number;
    advancePercentage: number;
    requiresDirectorApproval: boolean;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  effectiveFrom: Date;

  @Prop()
  effectiveTo?: Date;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy?: string;
}

export const TravelRateConfigSchema =
  SchemaFactory.createForClass(TravelRateConfig);

// Indexes
TravelRateConfigSchema.index({ gradeCode: 1, travelType: 1, isActive: 1 });
TravelRateConfigSchema.index({ isActive: 1 });
TravelRateConfigSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
