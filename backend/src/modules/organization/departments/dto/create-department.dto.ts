import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsMongoId, MaxLength, MinLength } from 'class-validator';
import { Types } from 'mongoose';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'Human Resources',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  departmentName: string;

  @ApiProperty({
    description: 'Unique department code',
    example: 'HR-001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  departmentCode: string;

  @ApiPropertyOptional({
    description: 'Department description',
    example: 'Handles all human resource management activities',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent department ID for sub-departments',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  parentDepartmentId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Position ID of department head',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsOptional()
  departmentHeadPositionId?: Types.ObjectId;
}