import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class DepartmentHierarchyDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  departmentName: string;

  @ApiProperty()
  departmentCode: string;

  @ApiPropertyOptional()
  level: number;

  @ApiPropertyOptional()
  path: string[];

  @ApiPropertyOptional()
  children?: DepartmentHierarchyDto[];

  @ApiPropertyOptional()
  parentDepartmentId?: Types.ObjectId;

  @ApiPropertyOptional()
  employeeCount?: number;
}