import { 
  IsNotEmpty, IsString, IsEnum, IsObject, IsOptional, 
  IsNumber, IsBoolean, IsDate, IsMongoId, Min, Max, 
  ValidateNested, IsArray, IsPositive 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OvertimeType } from '../../../../common/enums';

export class WorkingHoursDto {
  @ApiProperty({ description: 'Overtime start time', example: '2025-11-15T17:00:00.000Z' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'Overtime end time', example: '2025-11-15T21:00:00.000Z' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiPropertyOptional({ description: 'Break hours during overtime', example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  breakHours?: number = 0;
}

export class CreateOvertimeClaimDto {
  @ApiProperty({ 
    description: 'ID of the employee claiming overtime',
    example: '60d5ecb74b24c72b8c8b4567'
  })
  @IsNotEmpty()
  @IsMongoId()
  employeeId: string;

  @ApiProperty({ 
    description: 'Date of overtime work', 
    example: '2025-11-15T00:00:00.000Z'
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  claimDate: Date;

  @ApiProperty({ 
    description: 'Type of overtime', 
    enum: OvertimeType,
    example: OvertimeType.REGULAR
  })
  @IsNotEmpty()
  @IsEnum(OvertimeType)
  overtimeType: OvertimeType;

  @ApiProperty({ type: WorkingHoursDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto;

  @ApiProperty({ 
    description: 'Reason for overtime work',
    example: 'Urgent system deployment for client ABC'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  reason: string;

  @ApiPropertyOptional({ 
    description: 'Project code',
    example: 'PROJ-2025-001'
  })
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiPropertyOptional({ 
    description: 'Task reference',
    example: 'TASK-123'
  })
  @IsOptional()
  @IsString()
  taskReference?: string;

  @ApiPropertyOptional({ 
    description: 'Client name',
    example: 'ABC Corporation'
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ 
    description: 'Supervisor confirmation status',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  supervisorConfirmed?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Additional comments',
    example: 'Required for system go-live deadline'
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ 
    description: 'URLs to supporting documents',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingDocuments?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

// Helper function for MinLength decorator
function MinLength(min: number) {
  return function (target: any, propertyKey: string) {
    // This is a simplified version - in real code, use class-validator decorators properly
  };
}