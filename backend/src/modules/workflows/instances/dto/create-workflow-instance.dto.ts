import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType, WorkflowType } from '../../../../common/enums';

export class CreateWorkflowInstanceDto {
  @ApiProperty({
    description: 'Workflow definition ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  workflowDefinitionId: string;

  @ApiProperty({
    enum: WorkflowType,
    description: 'Type of workflow',
    example: WorkflowType.LEAVE_REQUEST
  })
  @IsEnum(WorkflowType)
  workflowType: WorkflowType;

  @ApiProperty({
    enum: EntityType,
    description: 'Type of entity this workflow is for',
    example: EntityType.EMPLOYEE
  })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({
    description: 'ID of the entity this workflow is for',
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Initial data for the workflow',
    example: { leaveDays: 5, startDate: '2024-01-01', reason: 'Vacation' }
  })
  @IsObject()
  @IsOptional()
  initialData?: any;

  @ApiPropertyOptional({
    description: 'Additional metadata for the workflow',
    example: { priority: 'high', category: 'annual' }
  })
  @IsObject()
  @IsOptional()
  metadata?: any;
}