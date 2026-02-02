import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../schemas/user.schema';

export class UserProfileDto {
  @ApiProperty()
  _id: string;  // Changed from 'id' to '_id' to match MongoDB

  @ApiProperty()
  userId: string;  // Alternative ID field

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  mustChangePassword: boolean;

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  profile: any;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: UserProfileDto;
}