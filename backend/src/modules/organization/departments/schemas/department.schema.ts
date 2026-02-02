import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../../common/schemas/base.schema';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true, collection: 'departments' })
export class Department extends BaseSchema {
  @Prop({ required: true, unique: true })
  departmentName: string;

  @Prop({ required: true, unique: true })
  departmentCode: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  parentDepartmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  departmentHeadPositionId?: Types.ObjectId;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// Only define indexes for non-unique fields
DepartmentSchema.index({ parentDepartmentId: 1 });