import { ApiProperty } from '@nestjs/swagger';

class CompensationResponseDto {
  @ApiProperty()
  basicSalary: { min: number; mid: number; max: number };

  @ApiProperty()
  houseAllowance: number;

  @ApiProperty()
  carAllowance: number;

  @ApiProperty()
  travelAllowance: number;

  @ApiProperty()
  overtimeRate: number;
}

class LimitsResponseDto {
  @ApiProperty()
  maxLoanAmount: number;

  @ApiProperty()
  requiresManagerApproval: boolean;

  @ApiProperty()
  requiresDirectorApproval: boolean;

  @ApiProperty()
  maxApprovalLevel: string;
}

export class GradeResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  level: number;

  @ApiProperty({ enum: ['JUNIOR', 'OPERATIONAL', 'SUPERVISORY', 'MANAGERIAL', 'EXECUTIVE'] })
  band: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  compensation: CompensationResponseDto;

  @ApiProperty()
  limits: LimitsResponseDto;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  nextGrade?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}