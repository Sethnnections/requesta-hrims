import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { StageType, ApprovalRuleType } from '../../../../common/enums';

export class CreateWorkflowStageDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: StageType })
  @IsEnum(StageType)
  stageType: StageType;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiPropertyOptional({ enum: ApprovalRuleType })
  @IsEnum(ApprovalRuleType)
  @IsOptional()
  approvalRuleType?: ApprovalRuleType;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  requiredApprovals?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  managerialLevel?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  minimumGrade?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  requiredRoles?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amountThreshold?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specificUserId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  autoApproveAfter?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  escalationUserId?: string;
}