import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StageType, ApprovalRuleType } from '../../../../common/enums';

export class WorkflowStageResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: StageType })
  stageType: StageType;

  @ApiProperty()
  order: number;

  @ApiPropertyOptional({ enum: ApprovalRuleType })
  approvalRuleType?: ApprovalRuleType;

  @ApiPropertyOptional()
  requiredApprovals?: number;

  @ApiPropertyOptional()
  managerialLevel?: number;

  @ApiPropertyOptional()
  minimumGrade?: string;

  @ApiPropertyOptional({ type: [String] })
  requiredRoles?: string[];

  @ApiPropertyOptional()
  amountThreshold?: number;

  @ApiPropertyOptional()
  specificUserId?: string;

  @ApiPropertyOptional()
  autoApproveAfter?: number;

  @ApiProperty()
  isMandatory: boolean;

  @ApiPropertyOptional()
  escalationUserId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}