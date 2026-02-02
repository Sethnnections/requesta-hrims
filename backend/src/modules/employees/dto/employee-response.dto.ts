import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { EmploymentStatus, ContractType } from '../../../common/enums';

export class EmployeeResponseDto {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty()
  employeeNumber: string;

  // Personal Information
  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional()
  middleName?: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  nationalId: string;

  // Contact Information
  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiPropertyOptional()
  personalEmail?: string;

  @ApiPropertyOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  emergencyContactPhone?: string;

  // Employment Information
  @ApiProperty()
  departmentId: Types.ObjectId;

  @ApiProperty()
  positionId: Types.ObjectId;

  @ApiProperty()
  gradeId: Types.ObjectId;

  @ApiPropertyOptional()
  reportsToEmployeeId?: Types.ObjectId;

  @ApiProperty()
  employmentDate: Date;

  @ApiProperty({ enum: ContractType })
  contractType: ContractType;

  @ApiProperty({ enum: EmploymentStatus })
  employmentStatus: EmploymentStatus;

  // Enhanced Bank & Financial Information
  @ApiProperty()
  bankName: string;

  @ApiProperty()
  bankAccountNumber: string;

  @ApiProperty()
  bankBranch: string;

  @ApiPropertyOptional()
  bankBranchCode?: string;

  @ApiPropertyOptional()
  bankSwiftCode?: string;

  @ApiPropertyOptional()
  currency?: string;

  @ApiPropertyOptional()
  taxIdentificationNumber?: string;

  @ApiPropertyOptional()
  pensionNumber?: string;

  @ApiPropertyOptional()
  socialSecurityNumber?: string;

  @ApiProperty()
  currentBasicSalary: number;

  // Additional Personal Information
  @ApiPropertyOptional()
  maritalStatus?: string;

  @ApiPropertyOptional()
  numberOfDependents?: number;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  postalCode?: string;

  // System Access
  @ApiProperty()
  hasSystemAccess: boolean;

  @ApiPropertyOptional()
  systemUsername?: string;

  @ApiPropertyOptional()
  systemRole?: string;

  // Verification
  @ApiProperty()
  profileVerified: boolean;

  @ApiPropertyOptional()
  profileVerifiedBy?: string;

  @ApiPropertyOptional()
  profileVerifiedAt?: Date;

  @ApiPropertyOptional()
  profilePhoto?: string;

  // Timestamps
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  updatedBy?: string;

  // Populated fields
  @ApiPropertyOptional()
  department?: any;

  @ApiPropertyOptional()
  position?: any;

  @ApiPropertyOptional()
  grade?: any;

  @ApiPropertyOptional()
  reportsTo?: any;

  @ApiPropertyOptional()
  directReports?: EmployeeResponseDto[];

  // Virtual fields
  @ApiPropertyOptional()
  fullName?: string;

  @ApiProperty({ enum: ['PENDING', 'REGISTERED', 'SYSTEM_ACCESS_ACTIVE', 'COMPLETED'] })
  registrationStatus: string;

  @ApiPropertyOptional()
  systemAccessActivatedAt?: Date;

  @ApiPropertyOptional()
  systemAccessActivatedBy?: string;

  @ApiProperty()
  welcomeEmailSent: boolean;

  @ApiProperty()
  credentialsEmailSent: boolean;
  isSupervisor: any;
  isDepartmentManager: any;
}