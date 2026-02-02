// workflows/definitions/dto/create-workflow-definition.dto.ts
import { IsString, IsEnum, IsArray, IsOptional, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowType } from '../../../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class WorkflowStageDto {
  @ApiProperty({ description: 'Stage number (1, 2, 3, ...)' })
  @IsNumber()
  stage: number;

  @ApiProperty({ description: 'Name of the stage' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Approval rule type',
    enum: ['SUPERVISOR', 'MANAGERIAL_LEVEL', 'GRADE_BASED', 'FINANCE', 'DEPARTMENT_HEAD', 'ROLE_BASED', 'SPECIFIC_USER']
  })
  @IsString()
  approvalRule: string;

  @ApiProperty({ description: 'Configuration for the approval rule', type: Object, required: false })
  @IsOptional()
  ruleConfig?: any;
}

export class CreateWorkflowDefinitionDto {
  @ApiProperty({ description: 'Name of the workflow definition' })
  @IsString()
  name: string;

  @ApiProperty({ enum: WorkflowType, description: 'Type of workflow' })
  @IsEnum(WorkflowType)
  workflowType: WorkflowType;

  @ApiProperty({ description: 'Department code or ALL for company-wide' })
  @IsString()
  department: string;

  @ApiProperty({ description: 'Description of the workflow', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [WorkflowStageDto], description: 'Stages of the workflow' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStageDto)
  stages: WorkflowStageDto[];

  @ApiProperty({ description: 'Whether the definition is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}