import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PositionResponseDto {
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
  jobDescription?: string;

  @ApiPropertyOptional()
  responsibilities?: string[];

  @ApiProperty()
  isHeadOfDepartment: boolean;

  @ApiProperty()
  isSupervisorRole: boolean;

  @ApiProperty()
  isManagerRole: boolean;

  @ApiProperty()
  isDirectorRole: boolean;

  @ApiProperty()
  numberOfPositions: number;

  @ApiProperty()
  currentlyFilled: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  updatedBy?: string;

  // Populated fields
  @ApiPropertyOptional()
  department?: any;

  @ApiPropertyOptional()
  grade?: any;

  @ApiPropertyOptional()
  reportsToPosition?: any;

  @ApiPropertyOptional()
  directReports?: PositionResponseDto[];

  @ApiPropertyOptional()
  availablePositions?: number;

  @ApiPropertyOptional()
  salaryRange?: string;
}