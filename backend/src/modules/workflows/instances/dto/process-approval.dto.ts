import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalAction } from '../../../../common/enums';

export class ProcessApprovalDto {
  @ApiProperty({
    enum: ApprovalAction,
    description: 'Approval action to perform',
    example: ApprovalAction.APPROVE
  })
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiPropertyOptional({
    description: 'Comments for the approval action',
    example: 'Looks good, approved'
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({
    description: 'User ID to delegate this approval to',
    example: '507f1f77bcf86cd799439013'
  })
  @IsString()
  @IsOptional()
  delegatedTo?: string;

  @ApiPropertyOptional({
    description: 'Data snapshot at the time of approval',
    example: { currentStage: 1, totalStages: 3 }
  })
  @IsObject()
  @IsOptional()
  dataSnapshot?: any;
}