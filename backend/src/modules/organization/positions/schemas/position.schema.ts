import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../../common/schemas/base.schema';

export type PositionDocument = Position & Document;

@Schema({ timestamps: true, collection: 'positions' })
export class Position extends BaseSchema {
  @Prop({ required: true })
  positionTitle: string;

  @Prop({ required: true, unique: true })
  positionCode: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Grade', required: true })
  gradeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  reportsToPositionId?: Types.ObjectId;

  @Prop()
  jobDescription?: string;

  @Prop({ type: [String], default: [] })
  responsibilities: string[];

  @Prop({ default: false })
  isHeadOfDepartment: boolean;

  @Prop({ default: false })
  isSupervisorRole: boolean;

  @Prop({ default: false })
  isManagerRole: boolean;

  @Prop({ default: false })
  isDirectorRole: boolean;

  @Prop({ required: true, default: 1 })
  numberOfPositions: number;

  @Prop({ default: 0 })
  currentlyFilled: number;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

// Only define indexes for non-unique fields
PositionSchema.index({ departmentId: 1 });
PositionSchema.index({ gradeId: 1 });
PositionSchema.index({ reportsToPositionId: 1 });