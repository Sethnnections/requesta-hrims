import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class DepartmentResponseDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  departmentName: string;

  @ApiProperty()
  departmentCode: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  parentDepartmentId?: Types.ObjectId;

  @ApiPropertyOptional()
  departmentHeadPositionId?: Types.ObjectId;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  updatedBy?: string;

  // Populated fields
  @ApiPropertyOptional()
  parentDepartment?: DepartmentResponseDto;

  @ApiPropertyOptional()
  subDepartments?: DepartmentResponseDto[];

  @ApiPropertyOptional()
  employeeCount?: number;
}