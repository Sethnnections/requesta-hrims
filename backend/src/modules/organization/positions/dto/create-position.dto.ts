import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreatePositionDto {
  @ApiProperty({
    description: 'Position title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  positionTitle: string;

  @ApiProperty({
    description: 'Unique position code',
    example: 'IT-DEV-SE-001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  positionCode: string;

  @ApiProperty({
    description: 'Department ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  departmentId: Types.ObjectId;

  @ApiProperty({
    description: 'Grade ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsNotEmpty()
  gradeId: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Position this role reports to',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId()
  @IsOptional()
  reportsToPositionId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Job description',
    example: 'Responsible for developing and maintaining software applications',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  jobDescription?: string;

  @ApiPropertyOptional({
    description: 'List of responsibilities',
    example: ['Develop software', 'Code review', 'Mentor junior developers'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  responsibilities?: string[];

  @ApiPropertyOptional({
    description: 'Is this position the head of department',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isHeadOfDepartment?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a supervisor role',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSupervisorRole?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a manager role',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isManagerRole?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a director role',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDirectorRole?: boolean;

  @ApiPropertyOptional({
    description: 'Number of positions available',
    example: 3,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  numberOfPositions?: number;
}