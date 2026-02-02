import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type UserDocument = User & Document;

export enum UserRole {
  SUPER_SUPER_ADMIN = 'super_super_admin',  
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  HR_ADMIN = 'hr_admin',
  HR_MANAGER = 'hr_manager',
  FINANCE_MANAGER = 'finance_manager',
  DEPARTMENT_HEAD = 'department_head',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
  TRAVEL_ADMIN = 'travel_admin',
  ADMIN_EMPLOYEE = 'admin_employee', 
  PAYROLL_ADMIN = 'payroll_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum LoginMethod {
  USERNAME = 'username',
  EMAIL = 'email',
  BOTH = 'both'
}

@Schema({ timestamps: true, collection: 'users' })
export class User extends BaseSchema {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, unique: true })
  employeeId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.EMPLOYEE 
  })
  role: UserRole;

  @Prop({ 
    type: String, 
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING 
  })
  status: UserStatus;

  @Prop({ 
    type: String, 
    enum: Object.values(LoginMethod),
    default: LoginMethod.BOTH 
  })
  loginMethod: LoginMethod;

  @Prop({ default: Date.now })
  lastLoginAt: Date;

  @Prop({ default: Date.now })
  lastActivityAt: Date;

  @Prop()
  passwordChangedAt?: Date;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  lockedUntil?: Date;

  @Prop({ default: false })
  mustChangePassword: boolean;

  @Prop()
  refreshToken?: string;

  @Prop()
  refreshTokenExpires?: Date;

  // Custom permissions (for super admin to override)
  @Prop({ type: Object, default: {} })
  customPermissions: Record<string, boolean>;

  // Password reset fields
  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop({ default: 0 })
  passwordResetAttempts: number;

  @Prop()
  lastPasswordResetAt?: Date;

  // Profile fields
  @Prop()
  profilePicture?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop({ 
    type: String,
    enum: ['PENDING', 'REGISTERED', 'SYSTEM_ACCESS_ACTIVE', 'COMPLETED'],
    default: 'PENDING'
  })
  registrationStatus: string;

  @Prop()
  systemAccessActivatedAt?: Date;

  @Prop()
  systemAccessActivatedBy?: string;

  @Prop({ default: false })
  welcomeEmailSent: boolean;

  @Prop({ default: false })
  credentialsEmailSent: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ lastActivityAt: 1 });
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ passwordResetExpires: 1 });
UserSchema.index({ emailVerificationToken: 1 });