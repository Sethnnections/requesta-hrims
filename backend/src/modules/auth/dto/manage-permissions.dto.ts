import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class ManageUserPermissionsDto {
  @ApiProperty({ description: 'User ID to manage permissions for' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: 'Permissions to assign (key: permission string, value: boolean)',
    example: { 'travel:create': true, 'travel:approve': false }
  })
  @IsObject()
  permissions: Record<string, boolean>;

  @ApiProperty({ description: 'Reason for permission change' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'User ID to update role for' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: UserRole, description: 'New role to assign' })
  @IsEnum(UserRole)
  newRole: UserRole;

  @ApiProperty({ description: 'Reason for role change' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class BulkPermissionsUpdateDto {
  @ApiProperty({ 
    description: 'Array of user IDs and their permission updates',
    example: [
      { userId: 'user1', permissions: { 'travel:create': true } },
      { userId: 'user2', permissions: { 'travel:approve': true } }
    ]
  })
  @IsObject({ each: true })
  updates: Array<{
    userId: string;
    permissions: Record<string, boolean>;
  }>;

  @ApiProperty({ description: 'Reason for bulk update' })
  @IsString()
  @IsOptional()
  reason?: string;
}