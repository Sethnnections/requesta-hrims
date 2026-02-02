import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { SystemRole } from '../../../common/enums';

export class ActivateSystemAccessDto {
  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  systemUsername: string;

  @ApiProperty({ 
    example: SystemRole.EMPLOYEE, 
    enum: SystemRole
  })
  @IsEnum(SystemRole)
  @IsNotEmpty()
  systemRole: SystemRole;

  @ApiProperty({ 
    description: 'Optional: Use employee email as username instead of provided username',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  useEmailAsUsername?: boolean;
}