import { WorkflowType } from '../../../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class WorkflowStageResponseDto {
  @ApiProperty()
  stage: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  approvalRule: string;

  @ApiProperty({ required: false })
  ruleConfig?: any;
}

export class WorkflowDefinitionResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: WorkflowType })
  workflowType: WorkflowType;

  @ApiProperty()
  department: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: [WorkflowStageResponseDto] })
  stages: WorkflowStageResponseDto[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}