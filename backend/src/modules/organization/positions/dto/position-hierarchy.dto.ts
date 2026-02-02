import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PositionHierarchyDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  positionTitle: string;

  @ApiProperty()
  positionCode: string;

  @ApiProperty()
  departmentId: Types.ObjectId;

  @ApiProperty()
  gradeId: Types.ObjectId;

  @ApiPropertyOptional()
  reportsToPositionId?: Types.ObjectId;

  @ApiPropertyOptional()
  level: number;

  @ApiPropertyOptional()
  path: string[];

  @ApiPropertyOptional()
  children?: PositionHierarchyDto[];

  @ApiPropertyOptional()
  employeeCount?: number;

  @ApiPropertyOptional()
  department?: any;

  @ApiPropertyOptional()
  grade?: any;
}