import { IsNotEmpty, IsNumber, IsString, IsArray, IsOptional, Min, Max, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanApplicationDto {
  @ApiProperty({
    description: 'ID of the employee applying for the loan',
    example: '60d5ecb74b24c72b8c8b4567'
  })
  @IsNotEmpty()
  @IsMongoId()
  employeeId: string;

  @ApiProperty({
    description: 'Type of loan being applied for',
    example: 'PERSONAL_LOAN'
  })
  @IsNotEmpty()
  @IsString()
  loanType: string;

  @ApiProperty({
    description: 'Amount requested for the loan',
    example: 50000,
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Currency of the loan amount',
    example: 'MWK',
    default: 'MWK'
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Purpose of the loan',
    example: 'Home renovation'
  })
  @IsNotEmpty()
  @IsString()
  purpose: string;

  @ApiProperty({
    description: 'Repayment period in months',
    example: 24,
    minimum: 1,
    maximum: 120
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(120)
  repaymentPeriod: number;

  @ApiPropertyOptional({
    description: 'URLs to supporting documents',
    example: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingDocuments?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata for the loan application',
    example: { priority: 'high', specialConditions: 'none' }
  })
  @IsOptional()
  metadata?: any;
}
