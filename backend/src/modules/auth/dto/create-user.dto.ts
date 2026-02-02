import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { UserRole, LoginMethod } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string; 

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ enum: UserRole, example: UserRole.EMPLOYEE })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ enum: LoginMethod, example: LoginMethod.BOTH })
  @IsEnum(LoginMethod)
  @IsOptional()
  loginMethod?: LoginMethod;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  mustChangePassword?: boolean;
}