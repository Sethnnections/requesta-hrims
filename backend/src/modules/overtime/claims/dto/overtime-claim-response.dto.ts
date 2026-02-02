import { ApiProperty } from '@nestjs/swagger';
import { OvertimeType, ClaimStatus } from '../../../../common/enums';

export class OvertimeClaimResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  claimReference: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  claimDate: Date;

  @ApiProperty({ enum: OvertimeType })
  overtimeType: OvertimeType;

  @ApiProperty()
  workingHours: {
    startTime: Date;
    endTime: Date;
    totalHours: number;
    breakHours: number;
  };

  @ApiProperty()
  reason: string;

  @ApiProperty({ required: false })
  projectCode?: string;

  @ApiProperty({ required: false })
  taskReference?: string;

  @ApiProperty({ required: false })
  clientName?: string;

  @ApiProperty()
  supervisorConfirmed: boolean;

  @ApiProperty({ required: false })
  supervisorConfirmationDate?: Date;

  @ApiProperty({ required: false })
  confirmedBy?: string;

  @ApiProperty({ required: false })
  calculatedPayments?: {
    basicHourlyRate: number;
    overtimeRate: number;
    overtimeMultiplier: number;
    totalAmount: number;
    calculatedHours: number;
    gradeMultiplier: number;
  };

  @ApiProperty({ required: false })
  approvalRules?: {
    isAutoApproved: boolean;
    autoApprovalReason?: string;
    requiresManagerApproval: boolean;
    requiresHrApproval: boolean;
    requiresFinanceApproval: boolean;
  };

  @ApiProperty({ enum: ClaimStatus })
  status: ClaimStatus;

  @ApiProperty({ required: false })
  workflowId?: string;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  processedAt?: Date;

  @ApiProperty({ required: false })
  paidAt?: Date;

  @ApiProperty({ required: false })
  payrollPeriod?: string;

  @ApiProperty({ required: false })
  comments?: string;

  @ApiProperty({ type: [String], required: false })
  supportingDocuments?: string[];

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}