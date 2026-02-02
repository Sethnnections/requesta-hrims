import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, IsNotEmpty, IsEmail, IsDate, IsEnum, IsOptional, 
  IsMongoId, IsPhoneNumber, Min, IsNumber, 
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { EmploymentStatus, ContractType } from '../../../common/enums';

export class CreateEmployeeDto {
  // Personal Information
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional({ example: 'Michael' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsEnum(['male', 'female', 'other'])
  gender: string;

  @ApiProperty({ example: '1234567890123' })
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  // Contact Information
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+255123456789' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'john.doe.personal@gmail.com' })
  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '+255987654321' })
  @IsPhoneNumber()
  @IsOptional()
  emergencyContactPhone?: string;

  // Employment Information
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  departmentId: Types.ObjectId;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  positionId: Types.ObjectId;

  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  @IsMongoId()
  gradeId: Types.ObjectId;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439014' })
  @IsMongoId()
  @IsOptional()
  reportsToEmployeeId?: Types.ObjectId;

  @ApiProperty({ example: '2024-01-15' })
  @IsDate()
  @Type(() => Date)
  employmentDate: Date;

  @ApiPropertyOptional({ enum: ContractType, example: ContractType.PROBATION })
  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType;

  // Enhanced Bank & Financial Information
  @ApiProperty({ example: 'CRDB Bank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: '0151234567890' })
  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @ApiProperty({ example: 'Dar es Salaam City Center' })
  @IsString()
  @IsNotEmpty()
  bankBranch: string;

  @ApiPropertyOptional({ example: '1300' })
  @IsString()
  @IsOptional()
  bankBranchCode?: string;

  @ApiPropertyOptional({ example: 'CORUTZTZ' })
  @IsString()
  @IsOptional()
  bankSwiftCode?: string;

  @ApiPropertyOptional({ example: 'TZS', default: 'TZS' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  taxIdentificationNumber?: string;

  @ApiPropertyOptional({ example: 'PEN123456' })
  @IsString()
  @IsOptional()
  pensionNumber?: string;

  @ApiPropertyOptional({ example: 'SSN123456' })
  @IsString()
  @IsOptional()
  socialSecurityNumber?: string;

  @ApiPropertyOptional({ example: 750000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentBasicSalary?: number;

  // Additional Personal Information
  @ApiPropertyOptional({ enum: ['single', 'married', 'divorced', 'widowed'], example: 'married' })
  @IsEnum(['single', 'married', 'divorced', 'widowed'])
  @IsOptional()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  numberOfDependents?: number;

  @ApiPropertyOptional({ example: '123 Main Street, Kinondoni' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Dar es Salaam' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Tanzania' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '14112' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  // System Access (Only for HR Admin)
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  createSystemAccess?: boolean;

  @ApiPropertyOptional({ example: 'john.doe' })
  @IsString()
  @IsOptional()
  systemUsername?: string;

  @ApiPropertyOptional({ 
    description: 'Whether the employee is a supervisor who can approve requests',
    example: false,
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  isSupervisor?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether the employee is a department manager',
    example: false,
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  isDepartmentManager?: boolean;

  // System Role (Enhanced)
  @ApiPropertyOptional({ 
    description: 'System role for access control',
    example: 'employee',
    enum: ['employee', 'supervisor', 'manager', 'department_head', 'hr_admin', 'finance_manager', 'system_admin'],
    default: 'employee'
  })
  @IsString()
  @IsOptional()
  systemRole?: string;

}