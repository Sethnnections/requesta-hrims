import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanTypeDto {
  @ApiProperty({
    description: 'Unique code for the loan type',
    example: 'PERSONAL_LOAN'
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Display name of the loan type',
    example: 'Personal Loan'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the loan type',
    example: 'Loan for personal use including home improvement, medical expenses, etc.'
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Minimum loan amount allowed',
    example: 10000,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minAmount: number;

  @ApiProperty({
    description: 'Maximum loan amount allowed',
    example: 500000,
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  maxAmount: number;

  @ApiProperty({
    description: 'Minimum repayment period in months',
    example: 6,
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  minRepaymentPeriod: number;

  @ApiProperty({
    description: 'Maximum repayment period in months',
    example: 60,
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  maxRepaymentPeriod: number;

  @ApiProperty({
    description: 'Annual interest rate as percentage',
    example: 12.5,
    minimum: 0,
    maximum: 100
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @ApiProperty({
    description: 'Processing fee as percentage or fixed amount',
    example: 2.5,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  processingFee: number;

  @ApiPropertyOptional({
    description: 'List of grade codes eligible for this loan type',
    example: ['M3', 'M4', 'M5', 'M6']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleGrades?: string[];

  @ApiPropertyOptional({
    description: 'List of required document types',
    example: ['PAYSLIP', 'ID_CARD', 'BANK_STATEMENT']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredDocuments?: string[];

  @ApiPropertyOptional({
    description: 'Terms and conditions for the loan type',
    example: { maxApplicationsPerYear: 2, requiresGuarantor: false }
  })
  @IsOptional()
  termsAndConditions?: any;

  @ApiPropertyOptional({
    description: 'Whether this loan type is active',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
