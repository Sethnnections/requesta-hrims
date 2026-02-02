import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class CompensationDto {
  @IsObject()
  basicSalary: {
    min: number;
    mid: number;
    max: number;
  };

  @IsNumber()
  @Min(0)
  houseAllowance: number;

  @IsNumber()
  @Min(0)
  carAllowance: number;

  @IsNumber()
  @Min(0)
  travelAllowance: number;

  @IsNumber()
  @Min(1.0)
  overtimeRate: number;
}

class LimitsDto {
  @IsNumber()
  @Min(0)
  maxLoanAmount: number;

  @IsBoolean()
  requiresManagerApproval: boolean;

  @IsBoolean()
  requiresDirectorApproval: boolean;

  @IsString()
  maxApprovalLevel: string;
}

export class CreateGradeDto {
  @IsString()
  name: string;

  @IsString()
  code: string; // M3, M4, M5, etc.

  @IsNumber()
  @Min(1)
  level: number;

  @IsEnum(['JUNIOR', 'OPERATIONAL', 'SUPERVISORY', 'MANAGERIAL', 'EXECUTIVE'])
  band: string;

  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => CompensationDto)
  compensation: CompensationDto;

  @ValidateNested()
  @Type(() => LimitsDto)
  limits: LimitsDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  nextGrade?: string;
}