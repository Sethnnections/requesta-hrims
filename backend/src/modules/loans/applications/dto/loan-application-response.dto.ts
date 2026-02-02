import { ApiProperty } from '@nestjs/swagger';
import { WorkflowStatus } from '../../../../common/enums';

export class EmployeeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeNumber: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  gradeCode: string;
}

export class LoanApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: EmployeeResponseDto, required: false })
  employee?: EmployeeResponseDto; // Make optional to match service logic

  @ApiProperty()
  loanType: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  purpose: string;

  @ApiProperty()
  repaymentPeriod: number;

  @ApiProperty()
  monthlyRepayment: number;

  @ApiProperty()
  interestRate: number;

  @ApiProperty()
  totalRepayment: number;

  @ApiProperty({ type: [String], required: false })
  supportingDocuments?: string[];

  @ApiProperty({ required: false })
  workflowId?: string;

  @ApiProperty({ enum: WorkflowStatus })
  status: WorkflowStatus;

  @ApiProperty({ required: false })
  approvedAmount?: number;

  @ApiProperty({ required: false })
  approvedInterestRate?: number;

  @ApiProperty({ required: false })
  approvedRepaymentPeriod?: number;

  @ApiProperty({ required: false })
  approvalDate?: Date;

  @ApiProperty({ required: false })
  disbursementDate?: Date;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}