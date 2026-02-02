import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CalculateCompensationDto {
  @ApiProperty({
    description: 'Basic salary amount',
    example: 75000,
  })
  @IsNumber()
  @Min(0)
  basicSalary: number;
}

export class CompensationBreakdownDto {
  @ApiProperty()
  basicSalary: number;

  @ApiProperty()
  houseAllowance: number;

  @ApiProperty()
  carAllowance: number;

  @ApiProperty()
  travelAllowance: number;

  @ApiProperty()
  totalAllowances: number;

  @ApiProperty()
  grossSalary: number;

  @ApiProperty()
  pensionContribution: number;

  @ApiProperty()
  overtimeRateRegular: number;

  @ApiProperty()
  overtimeRateWeekend: number;

  @ApiProperty()
  overtimeRateHoliday: number;

  @ApiProperty()
  maximumLoanEligibility: number;
}