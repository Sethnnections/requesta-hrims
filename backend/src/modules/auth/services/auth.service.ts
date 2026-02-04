/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
  LoginMethod,
} from '../schemas/user.schema';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthResponseDto, UserProfileDto } from '../dto/auth-response.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import {
  Employee,
  EmployeeDocument,
} from '../../employees/schemas/employee.schema';
import { Department } from '../../organization/departments/schemas/department.schema';
import { Grade } from '../../organization/grades/schemas/grade.schema';
import { Position } from '../../organization/positions/schemas/position.schema';
import {
  PopulatedEmployee,
  UserDocumentWithPopulated,
} from '../interfaces/user-populated.interface';
import { OrganizationSeederService } from './organization-seeder.service';
import {
  SYSTEM_PERMISSIONS,
  UserPermissions,
} from '../interfaces/permission.interface';
import { SystemRole } from '../../../common/enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly JWT_EXPIRES_IN: number;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  JWT_EXPIRES_IN_STRING: string;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Department.name) private departmentModel: Model<any>,
    @InjectModel(Grade.name) private gradeModel: Model<any>,
    @InjectModel(Position.name) private positionModel: Model<any>,
    private organizationSeederService: OrganizationSeederService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
     // Get JWT expiration from config
  const expiresIn = this.configService.get<string | number>('JWT_EXPIRES_IN');
  
  if (typeof expiresIn === 'number') {
    // If it's a number, assume it's seconds and convert to string
    this.JWT_EXPIRES_IN = expiresIn;
    this.JWT_EXPIRES_IN_STRING = `${expiresIn}s`;
  } else if (typeof expiresIn === 'string') {
    // If it's a string like '8h', parse it
    this.JWT_EXPIRES_IN_STRING = expiresIn;
    // Convert to seconds for internal use if needed
    if (expiresIn.endsWith('h')) {
      this.JWT_EXPIRES_IN = parseInt(expiresIn) * 3600;
    } else if (expiresIn.endsWith('m')) {
      this.JWT_EXPIRES_IN = parseInt(expiresIn) * 60;
    } else if (expiresIn.endsWith('s')) {
      this.JWT_EXPIRES_IN = parseInt(expiresIn);
    }
  } else {
    this.JWT_EXPIRES_IN = 28800;
    this.JWT_EXPIRES_IN_STRING = '8h';
  }
  }

  // Type guard to check if employeeId is populated
  private isEmployeePopulated(
    employeeId: any,
  ): employeeId is PopulatedEmployee {
    return (
      employeeId &&
      typeof employeeId === 'object' &&
      '_id' in employeeId &&
      'firstName' in employeeId
    );
  }

  // Helper to safely get employee ID
  private getEmployeeId(user: UserDocumentWithPopulated): string {
    if (this.isEmployeePopulated(user.employeeId)) {
      return user.employeeId._id.toString();
    }
    return user.employeeId.toString();
  }

  /**
   * Convert string role to SystemRole enum
   */
  private convertToSystemRole(role: string): SystemRole {
    // Convert string to SystemRole enum
    const systemRoleKey = Object.keys(SystemRole).find(
      (key) =>
        SystemRole[key as keyof typeof SystemRole].toLowerCase() ===
        role.toLowerCase(),
    );

    if (systemRoleKey) {
      return SystemRole[systemRoleKey as keyof typeof SystemRole];
    }

    // Default to EMPLOYEE if not found
    return SystemRole.EMPLOYEE;
  }

  /**
   * Map UserRole to SystemRole (they should have same values)
   */
  private mapUserRoleToSystemRole(userRole: UserRole): SystemRole {
    const roleString = userRole.toString();
    return this.convertToSystemRole(roleString);
  }

  /**
   * Validate user by email or username
   */
  async validateUser(
    identifier: string,
    password: string,
  ): Promise<UserDocumentWithPopulated> {
    // Determine if identifier is email or username
    const isEmail = identifier.includes('@');

    const query = isEmail ? { email: identifier } : { username: identifier };

    const user = (await this.userModel
      .findOne(query)
      .populate('employeeId')
      .exec()) as UserDocumentWithPopulated;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check login method restrictions
    if (user.loginMethod === LoginMethod.USERNAME && isEmail) {
      throw new UnauthorizedException('Please use username to login');
    }

    if (user.loginMethod === LoginMethod.EMAIL && !isEmail) {
      throw new UnauthorizedException('Please use email to login');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Account is locked. Try again in ${minutesLeft} minutes.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      // Lock account after max failed attempts
      if (user.failedLoginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
        user.failedLoginAttempts = 0;
        await user.save();
        throw new ForbiddenException(
          `Account locked due to too many failed attempts. Try again in ${this.LOCKOUT_DURATION / 60000} minutes.`,
        );
      }

      await user.save();
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date();
    await user.save();

    return user;
  }

  /**
   * User login with email or username
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.validateUser(
        loginDto.identifier,
        loginDto.password,
      );

      const employeeId = this.getEmployeeId(user);

      // Get user permissions
      const permissions = await this.getUserPermissions(user._id.toString());

      const payload = {
        username: user.username,
        email: user.email,
        sub: user._id.toString(),
        role: user.role,
        employeeId: employeeId,
        permissions: permissions.effectivePermissions,
        iat: Math.floor(Date.now() / 1000),
      };

      this.logger.log(`User ${user.username} logged in successfully`);

      // In login method:
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.JWT_EXPIRES_IN, // This should be a string like '8h' or '28800s'
      });

      const refreshToken = this.jwtService.sign(
        { ...payload, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Store refresh token
      user.refreshToken = await bcrypt.hash(refreshToken, 10);
      user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      const userProfile = await this.getUserProfile(user._id.toString());

      const userResponse: UserProfileDto = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: employeeId,
        mustChangePassword: user.mustChangePassword || false,
        permissions: permissions.effectivePermissions,
        profile: userProfile,
      };

      return {
        accessToken,
        refreshToken,
        expiresIn: this.JWT_EXPIRES_IN,
        user: userResponse,
      };
    } catch (error) {
      this.logger.error(
        `Login failed for identifier: ${loginDto.identifier}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create new user account
   */
  async createUser(
    createUserDto: CreateUserDto,
    createdBy: string,
  ): Promise<User> {
    try {
      // Check if username already exists
      const existingUsername = await this.userModel.findOne({
        username: createUserDto.username,
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }

      // Check if email already exists
      const existingEmail = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      // Check if employee exists and doesn't already have a user account
      const employee = await this.employeeModel.findById(
        createUserDto.employeeId,
      );
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      const existingEmployeeUser = await this.userModel.findOne({
        employeeId: createUserDto.employeeId,
      });
      if (existingEmployeeUser) {
        throw new ConflictException('Employee already has a user account');
      }

      // Validate password strength
      this.validatePasswordStrength(createUserDto.password);

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      const userData = {
        ...createUserDto,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        createdBy,
        lastActivityAt: new Date(),
        failedLoginAttempts: 0,
        emailVerified: false,
      };

      const user = new this.userModel(userData);
      const savedUser = await user.save();

      // Update employee system access fields with proper SystemRole conversion
      employee.hasSystemAccess = true;
      employee.systemUsername = createUserDto.username;
      employee.systemRole = this.mapUserRoleToSystemRole(createUserDto.role);
      await employee.save();

      // Send email verification
      await this.sendEmailVerification(savedUser);

      this.logger.log(
        `User account created for employee: ${employee.employeeNumber}`,
      );

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      // Verify it's a refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = (await this.userModel
        .findById(payload.sub)
        .populate('employeeId')
        .exec()) as UserDocumentWithPopulated;

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (!user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const employeeId = this.getEmployeeId(user);

      // Get updated permissions
      const permissions = await this.getUserPermissions(user._id.toString());

      const newPayload = {
        username: user.username,
        email: user.email,
        sub: user._id.toString(),
        role: user.role,
        employeeId: employeeId,
        permissions: permissions.effectivePermissions,
        iat: Math.floor(Date.now() / 1000),
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: `${this.JWT_EXPIRES_IN}s`, // This adds 's' suffix
      });

      const newRefreshToken = this.jwtService.sign(
        { ...newPayload, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Update refresh token
      user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
      user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      user.lastActivityAt = new Date();
      await user.save();

      const userProfile = await this.getUserProfile(user._id.toString());

      const userResponse: UserProfileDto = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: employeeId,
        mustChangePassword: user.mustChangePassword || false,
        permissions: permissions.effectivePermissions,
        profile: userProfile,
      };

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.JWT_EXPIRES_IN,
        user: userResponse,
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * User logout
   */
  async logout(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        refreshToken: null,
        refreshTokenExpires: null,
        lastActivityAt: new Date(),
      });
      this.logger.log(`User ${userId} logged out successfully`);
    } catch (error) {
      this.logger.error(`Logout failed for user ${userId}:`, error);
      throw new InternalServerErrorException('Logout failed');
    }
  }

  /**
   * Update user activity timestamp
   */
  async updateActivity(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { lastActivityAt: new Date() },
        { new: false },
      );
    } catch (error) {
      this.logger.error(`Failed to update activity for user ${userId}:`, error);
    }
  }

  /**
   * Validate user session
   */
  async validateSession(userId: string): Promise<boolean> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('lastActivityAt status')
        .lean()
        .exec();

      if (!user || !user.lastActivityAt) return false;

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) return false;

      // Check if user has been inactive for more than session timeout
      const inactiveTime = Date.now() - new Date(user.lastActivityAt).getTime();

      return inactiveTime <= this.SESSION_TIMEOUT;
    } catch (error) {
      this.logger.error(`Session validation failed for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Check if new password matches confirmation
      if (
        changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword
      ) {
        throw new BadRequestException(
          'New password and confirmation do not match',
        );
      }

      // Check if new password is different from current
      const isSameAsCurrent = await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password,
      );

      if (isSameAsCurrent) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }

      // Validate password strength
      this.validatePasswordStrength(changePasswordDto.newPassword);

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        12,
      );

      // Update user
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      user.mustChangePassword = false;
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;

      await user.save();

      this.logger.log(`Password changed successfully for user ${userId}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      this.logger.error(`Password change failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Forgot password - initiate reset process
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    try {
      // Find user by email
      const user = await this.userModel.findOne({
        email: forgotPasswordDto.email,
        status: UserStatus.ACTIVE,
      });

      if (!user) {
        // Return generic message for security
        return {
          message: 'If the email exists, a password reset link has been sent',
        };
      }

      // Check if there are too many reset attempts
      if (user.passwordResetAttempts >= 5) {
        throw new ForbiddenException(
          'Too many password reset attempts. Please contact administrator.',
        );
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);

      // Set reset token and expiry (1 hour)
      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      user.passwordResetAttempts += 1;
      await user.save();

      // Send password reset email
      await this.sendPasswordResetEmail(user.email, resetToken, user.username);

      this.logger.log(`Password reset initiated for user: ${user.username}`);

      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    } catch (error) {
      this.logger.error('Forgot password process failed:', error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      // Find user by reset token
      const users = await this.userModel
        .find({
          passwordResetExpires: { $gt: new Date() },
        })
        .exec();

      let user: UserDocument | null = null;
      for (const u of users) {
        if (
          u.passwordResetToken &&
          (await bcrypt.compare(resetPasswordDto.token, u.passwordResetToken))
        ) {
          user = u;
          break;
        }
      }

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Check if new password matches confirmation
      if (
        resetPasswordDto.newPassword !== resetPasswordDto.confirmNewPassword
      ) {
        throw new BadRequestException(
          'New password and confirmation do not match',
        );
      }

      // Validate password strength
      this.validatePasswordStrength(resetPasswordDto.newPassword);

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        12,
      );

      // Update user
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetAttempts = 0;
      user.lastPasswordResetAt = new Date();
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      user.mustChangePassword = false;

      await user.save();

      // Send confirmation email
      await this.sendPasswordResetConfirmationEmail(user.email, user.username);

      this.logger.log(`Password reset successfully for user: ${user.username}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      this.logger.error('Password reset failed:', error);
      throw error;
    }
  }

  /**
   * Force password change (admin function)
   */
  async forcePasswordChange(
    userId: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate password strength
      this.validatePasswordStrength(newPassword);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      user.mustChangePassword = false;
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;

      await user.save();

      this.logger.log(`Password forced change for user ${userId} by admin`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      this.logger.error(
        `Force password change failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Set must change password flag
   */
  async setMustChangePassword(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { mustChangePassword: true },
        { new: true },
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`Must change password flag set for user ${userId}`);

      return {
        message: 'User will be required to change password on next login',
      };
    } catch (error) {
      this.logger.error(
        `Set must change password failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get role-based permissions
      const rolePermissions = SYSTEM_PERMISSIONS.filter((permission) =>
        permission.allowedRoles.includes(user.role),
      ).map((permission) => `${permission.module}:${permission.action}`);

      // Get custom permissions
      const customPermissions = Object.entries(user.customPermissions || {})
        .filter(([_, allowed]) => allowed)
        .map(([permission]) => permission);

      // Combine permissions (custom permissions override role permissions)
      const effectivePermissions = [
        ...new Set([...rolePermissions, ...customPermissions]),
      ];

      return {
        rolePermissions,
        customPermissions,
        effectivePermissions,
      };
    } catch (error) {
      this.logger.error(
        `Get user permissions failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update user permissions (Super Admin only)
   */
  async updateUserPermissions(
    userId: string,
    permissions: Record<string, boolean>,
    updatedBy: string,
  ): Promise<{ message: string }> {
    try {
      const updater = await this.userModel.findById(updatedBy);
      if (updater?.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException(
          'Only super admins can manage permissions',
        );
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate permissions
      const validPermissions = SYSTEM_PERMISSIONS.map(
        (p) => `${p.module}:${p.action}`,
      );
      const invalidPermissions = Object.keys(permissions).filter(
        (p) => !validPermissions.includes(p),
      );

      if (invalidPermissions.length > 0) {
        throw new BadRequestException(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
        );
      }

      user.customPermissions = permissions;
      user.updatedBy = updatedBy;
      await user.save();

      this.logger.log(
        `Permissions updated for user ${userId} by super admin ${updatedBy}`,
      );

      return { message: 'User permissions updated successfully' };
    } catch (error) {
      this.logger.error(
        `Update user permissions failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get complete user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = (await this.userModel
        .findById(userId)
        .populate('employeeId')
        .exec()) as UserDocumentWithPopulated;

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const permissions = await this.getUserPermissions(userId);

      // Build comprehensive profile
      const profile = {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        loginMethod: user.loginMethod,
        mustChangePassword: user.mustChangePassword,
        emailVerified: user.emailVerified,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        lastLoginAt: user.lastLoginAt,
        lastActivityAt: user.lastActivityAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions: permissions.effectivePermissions,
        employee: null as any,
      };

      // Add employee details if available
      if (user.employeeId) {
        if (this.isEmployeePopulated(user.employeeId)) {
          const employee = user.employeeId;
          profile.employee = {
            employeeId: this.safeGetId(employee),
            employeeNumber: employee.employeeNumber,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            departmentId: this.safeGetId(employee.departmentId),
            positionId: this.safeGetId(employee.positionId),
            gradeId: this.safeGetId(employee.gradeId),
            employmentStatus: employee.employmentStatus,
          };
        } else {
          // If not populated, fetch employee details
          const employee = await this.employeeModel
            .findById(user.employeeId)
            .populate('departmentId')
            .populate('positionId')
            .populate('gradeId')
            .exec();

          if (employee) {
            const employeePlain = this.safeConvertDocument(employee);

            profile.employee = {
              employeeId: employeePlain._id,
              employeeNumber: employeePlain.employeeNumber,
              firstName: employeePlain.firstName,
              lastName: employeePlain.lastName,
              email: employeePlain.email,
              departmentId: employeePlain.departmentId,
              positionId: employeePlain.positionId,
              gradeId: employeePlain.gradeId,
              employmentStatus: employeePlain.employmentStatus,
            };
          }
        }
      }
      return profile;
    } catch (error) {
      this.logger.error(`Get user profile failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateData: {
      username?: string;
      email?: string;
      phoneNumber?: string;
      profilePicture?: string;
      loginMethod?: LoginMethod;
    },
  ): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check username uniqueness if changing
      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await this.userModel.findOne({
          username: updateData.username,
          _id: { $ne: userId },
        });
        if (existingUser) {
          throw new ConflictException('Username already exists');
        }
      }

      // Check email uniqueness if changing
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.userModel.findOne({
          email: updateData.email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }

        // If email changed, require verification
        const userObj = user.toObject();
        await this.sendEmailVerification({
          ...userObj,
          email: updateData.email,
        } as unknown as UserDocument);
      }

      const updatePayload: any = {
        ...updateData,
        updatedAt: new Date(),
      };

      if (updateData.email && updateData.email !== user.email) {
        updatePayload.emailVerified = false;
      }

      await this.userModel.findByIdAndUpdate(userId, updatePayload);

      this.logger.log(`Profile updated for user ${userId}`);

      return { message: 'Profile updated successfully' };
    } catch (error) {
      this.logger.error(`Update profile failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const users = await this.userModel
        .find({
          emailVerificationExpires: { $gt: new Date() },
        })
        .exec();

      let user: UserDocument | null = null;
      for (const u of users) {
        if (
          u.emailVerificationToken &&
          (await bcrypt.compare(token, u.emailVerificationToken))
        ) {
          user = u;
          break;
        }
      }

      if (!user) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      this.logger.log(`Email verified for user: ${user.username}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      this.logger.error('Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Check if password change is required
   */
  async checkPasswordChangeRequired(userId: string): Promise<boolean> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('mustChangePassword')
        .lean();
      return user ? user.mustChangePassword || false : false;
    } catch (error) {
      this.logger.error(
        `Check password change required failed for user ${userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Get organization status
   */
  async getOrganizationStatus(): Promise<{
    departments: number;
    grades: number;
    positions: number;
    employees: number;
    users: number;
  }> {
    try {
      const [departments, grades, positions, employees, users] =
        await Promise.all([
          this.departmentModel.countDocuments(),
          this.gradeModel.countDocuments(),
          this.positionModel.countDocuments(),
          this.employeeModel.countDocuments(),
          this.userModel.countDocuments(),
        ]);

      return {
        departments,
        grades,
        positions,
        employees,
        users,
      };
    } catch (error) {
      this.logger.error('Get organization status failed:', error);
      throw error;
    }
  }

  /**
   * Get password policy
   */
  getPasswordPolicy(): {
    minLength: number;
    requiresUpperCase: boolean;
    requiresLowerCase: boolean;
    requiresNumbers: boolean;
    requiresSpecialChars: boolean;
  } {
    return {
      minLength: 8,
      requiresUpperCase: true,
      requiresLowerCase: true,
      requiresNumbers: true,
      requiresSpecialChars: true,
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException(
        `Password must be at least ${minLength} characters long`,
      );
    }

    if (!hasUpperCase) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!hasLowerCase) {
      throw new BadRequestException(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!hasNumbers) {
      throw new BadRequestException(
        'Password must contain at least one number',
      );
    }

    if (!hasSpecialChar) {
      throw new BadRequestException(
        'Password must contain at least one special character',
      );
    }
  }

  /**
   * Send password reset email
   */
  private async sendPasswordResetEmail(
    email: string,
    token: string,
    username: string,
  ): Promise<void> {
    // TODO: Implement email service integration
    this.logger.log(`Password reset email sent to ${email}`);
    this.logger.debug(`Reset token for ${username}: ${token}`);

    // In production, this would send an actual email
    console.log(`Password reset email sent to: ${email}`);
    console.log(`Reset token: ${token}`);
    console.log(
      `Hello ${username}, use this token to reset your password: ${token}`,
    );
  }

  /**
   * Send password reset confirmation email
   */
  private async sendPasswordResetConfirmationEmail(
    email: string,
    username: string,
  ): Promise<void> {
    // TODO: Implement email service integration
    this.logger.log(`Password reset confirmation email sent to ${email}`);

    // In production, this would send an actual email
    console.log(`Password reset confirmation email sent to: ${email}`);
    console.log(
      `Hello ${username}, your password has been successfully reset.`,
    );
  }

  /**
   * Send email verification
   */
  private async sendEmailVerification(user: UserDocument): Promise<void> {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = await bcrypt.hash(verificationToken, 10);

    user.emailVerificationToken = verificationTokenHash;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // TODO: Implement email service to send verification email
    this.logger.log(`Email verification sent to: ${user.email}`);

    // In production, this would send an actual email
    console.log(`Email verification sent to: ${user.email}`);
    console.log(`Verification token: ${verificationToken}`);
  }

  /**
   * Get all users (Admin function)
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: any[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.userModel
          .find()
          .select(
            '-password -refreshToken -passwordResetToken -emailVerificationToken',
          )
          .populate(
            'employeeId',
            'employeeNumber firstName lastName email departmentId positionId',
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.userModel.countDocuments(),
      ]);

      return {
        users: users.map((user) => ({
          ...user,
          employee: user.employeeId,
        })),
        total,
      };
    } catch (error) {
      this.logger.error('Get all users failed:', error);
      throw error;
    }
  }

  /**
   * Update user status (Admin function)
   */
  async updateUserStatus(
    userId: string,
    status: UserStatus,
    updatedBy: string,
    reason?: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = status;
      user.updatedBy = updatedBy;
      await user.save();

      this.logger.log(
        `User ${userId} status updated to ${status} by ${updatedBy}. Reason: ${reason}`,
      );

      return { message: `User status updated to ${status}` };
    } catch (error) {
      this.logger.error(`Update user status failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Activate user account (Admin function)
   */
  async activateUserAccount(
    userId: string,
    adminId: string,
    reason?: string,
  ): Promise<{ message: string }> {
    try {
      const admin = await this.userModel.findById(adminId);
      if (!this.canManageUsers(admin?.role)) {
        throw new ForbiddenException(
          'You do not have permission to manage user accounts',
        );
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.status === UserStatus.ACTIVE) {
        throw new BadRequestException('User account is already active');
      }

      user.status = UserStatus.ACTIVE;
      user.updatedBy = adminId;
      await user.save();

      // Update corresponding employee status if needed
      await this.employeeModel.findByIdAndUpdate(user.employeeId, {
        employmentStatus: 'ACTIVE',
        updatedBy: adminId,
      });

      this.logger.log(
        `User ${userId} activated by admin ${adminId}. Reason: ${reason}`,
      );

      // Send activation notification email
      await this.sendAccountActivationEmail(user);

      return { message: 'User account activated successfully' };
    } catch (error) {
      this.logger.error(
        `Activate user account failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Deactivate user account (Admin function)
   */
  async deactivateUserAccount(
    userId: string,
    adminId: string,
    reason: string,
  ): Promise<{ message: string }> {
    try {
      const admin = await this.userModel.findById(adminId);
      if (!this.canManageUsers(admin?.role)) {
        throw new ForbiddenException(
          'You do not have permission to manage user accounts',
        );
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new BadRequestException('User account is not active');
      }

      user.status = UserStatus.INACTIVE;
      user.updatedBy = adminId;
      await user.save();

      this.logger.log(
        `User ${userId} deactivated by admin ${adminId}. Reason: ${reason}`,
      );

      // Send deactivation notification email
      await this.sendAccountDeactivationEmail(user, reason);

      return { message: 'User account deactivated successfully' };
    } catch (error) {
      this.logger.error(
        `Deactivate user account failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Suspend user account (Admin function)
   */
  async suspendUserAccount(
    userId: string,
    adminId: string,
    reason: string,
    suspendUntil?: Date,
  ): Promise<{ message: string }> {
    try {
      const admin = await this.userModel.findById(adminId);
      if (!this.canManageUsers(admin?.role)) {
        throw new ForbiddenException(
          'You do not have permission to manage user accounts',
        );
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = UserStatus.SUSPENDED;
      user.updatedBy = adminId;

      if (suspendUntil) {
        user.lockedUntil = suspendUntil;
      }

      await user.save();

      this.logger.log(
        `User ${userId} suspended by admin ${adminId} until ${suspendUntil}. Reason: ${reason}`,
      );

      // Send suspension notification email
      await this.sendAccountSuspensionEmail(user, reason, suspendUntil);

      return { message: 'User account suspended successfully' };
    } catch (error) {
      this.logger.error(
        `Suspend user account failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if user can manage other users
   */
  private canManageUsers(role?: UserRole): boolean {
    const allowedRoles = [
      UserRole.SUPER_ADMIN,
      UserRole.SYSTEM_ADMIN,
      UserRole.HR_ADMIN,
      UserRole.HR_MANAGER,
    ];
    return allowedRoles.includes(role as UserRole);
  }

  /**
   * Manage user permissions (Super Super Admin, Super Admin, and Admin Employee)
   */
  async manageUserPermissions(
    targetUserId: string,
    permissions: Record<string, boolean>,
    managedBy: string,
    reason?: string,
  ): Promise<{ message: string }> {
    try {
      // Check if manager has permission
      const manager = await this.userModel.findById(managedBy);
      if (!this.canManagePermissions(manager?.role)) {
        throw new ForbiddenException(
          'You do not have permission to manage user permissions',
        );
      }

      const targetUser = await this.userModel.findById(targetUserId);
      if (!targetUser) {
        throw new NotFoundException('Target user not found');
      }

      // Prevent managing permissions of higher-level users
      if (this.isHigherRole(targetUser.role, manager?.role)) {
        throw new ForbiddenException(
          'Cannot manage permissions of users with higher or equal role',
        );
      }

      // Validate permissions
      const validPermissions = SYSTEM_PERMISSIONS.map(
        (p) => `${p.module}:${p.action}`,
      );
      const invalidPermissions = Object.keys(permissions).filter(
        (p) => !validPermissions.includes(p),
      );

      if (invalidPermissions.length > 0) {
        throw new BadRequestException(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
        );
      }

      // Update permissions
      targetUser.customPermissions = {
        ...targetUser.customPermissions,
        ...permissions,
      };
      targetUser.updatedBy = managedBy;
      await targetUser.save();

      this.logger.log(
        `Permissions updated for user ${targetUserId} by ${managedBy}. Reason: ${reason}`,
      );

      // Log permission change
      await this.logPermissionChange(
        managedBy,
        targetUserId,
        permissions,
        reason,
      );

      return { message: 'User permissions updated successfully' };
    } catch (error) {
      this.logger.error(
        `Manage user permissions failed for user ${targetUserId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update user role (Super Super Admin only)
   */
  async updateUserRole(
    targetUserId: string,
    newRole: UserRole,
    updatedBy: string,
    reason?: string,
  ): Promise<{ message: string }> {
    try {
      const updater = await this.userModel.findById(updatedBy);
      if (updater?.role !== UserRole.SUPER_SUPER_ADMIN) {
        throw new ForbiddenException(
          'Only super super admins can change user roles',
        );
      }

      const targetUser = await this.userModel.findById(targetUserId);
      if (!targetUser) {
        throw new NotFoundException('Target user not found');
      }

      // Update role
      targetUser.role = newRole;
      targetUser.updatedBy = updatedBy;
      await targetUser.save();

      // Update corresponding employee system role if exists
      await this.employeeModel.findOneAndUpdate(
        { userId: targetUserId },
        { systemRole: this.mapUserRoleToSystemRole(newRole) },
      );

      this.logger.log(
        `User ${targetUserId} role changed from ${targetUser.role} to ${newRole} by super super admin ${updatedBy}. Reason: ${reason}`,
      );

      return { message: `User role updated to ${newRole}` };
    } catch (error) {
      this.logger.error(
        `Update user role failed for user ${targetUserId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get user permission audit log
   */
  async getPermissionAuditLog(
    userId: string,
    requesterId: string,
  ): Promise<any[]> {
    try {
      const requester = await this.userModel.findById(requesterId);
      if (!this.canViewAuditLog(requester?.role)) {
        throw new ForbiddenException(
          'You do not have permission to view audit logs',
        );
      }

      // In production, this would query an audit log collection
      // For now, return mock data
      return [
        {
          timestamp: new Date(),
          action: 'PERMISSION_UPDATE',
          targetUserId: userId,
          performedBy: requesterId,
          changes: { 'travel:approve': true },
          reason: 'Role change',
        },
      ];
    } catch (error) {
      this.logger.error(
        `Get permission audit log failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Bulk update user permissions
   */
  async bulkUpdatePermissions(
    updates: Array<{ userId: string; permissions: Record<string, boolean> }>,
    updatedBy: string,
    reason?: string,
  ): Promise<{ message: string; results: any[] }> {
    try {
      const updater = await this.userModel.findById(updatedBy);
      if (!this.canManagePermissions(updater?.role)) {
        throw new ForbiddenException(
          'You do not have permission to manage user permissions',
        );
      }

      const results: Array<{ userId: string; status: string; error?: string }> =
        [];
      const validPermissions = SYSTEM_PERMISSIONS.map(
        (p) => `${p.module}:${p.action}`,
      );

      for (const update of updates) {
        try {
          const targetUser = await this.userModel.findById(update.userId);
          if (!targetUser) {
            results.push({
              userId: update.userId,
              status: 'failed',
              error: 'User not found',
            });
            continue;
          }

          // Check permission hierarchy
          if (this.isHigherRole(targetUser.role, updater?.role)) {
            results.push({
              userId: update.userId,
              status: 'failed',
              error: 'Cannot manage higher role user',
            });
            continue;
          }

          // Validate permissions
          const invalidPermissions = Object.keys(update.permissions).filter(
            (p) => !validPermissions.includes(p),
          );

          if (invalidPermissions.length > 0) {
            results.push({
              userId: update.userId,
              status: 'failed',
              error: `Invalid permissions: ${invalidPermissions.join(', ')}`,
            });
            continue;
          }

          // Update permissions
          targetUser.customPermissions = {
            ...targetUser.customPermissions,
            ...update.permissions,
          };
          targetUser.updatedBy = updatedBy;
          await targetUser.save();

          results.push({ userId: update.userId, status: 'success' });

          // Log permission change
          await this.logPermissionChange(
            updatedBy,
            update.userId,
            update.permissions,
            reason,
          );
        } catch (error) {
          results.push({
            userId: update.userId,
            status: 'failed',
            error: error.message,
          });
        }
      }

      return {
        message: 'Bulk permission update completed',
        results,
      };
    } catch (error) {
      this.logger.error('Bulk update permissions failed:', error);
      throw error;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Check if user can manage permissions
   */
  private canManagePermissions(role?: UserRole): boolean {
    const allowedRoles = [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPLOYEE,
    ];
    return allowedRoles.includes(role as UserRole);
  }

  /**
   * Check if user can view audit logs
   */
  private canViewAuditLog(role?: UserRole): boolean {
    const allowedRoles = [
      UserRole.SUPER_SUPER_ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPLOYEE,
    ];
    return allowedRoles.includes(role as UserRole);
  }

  /**
   * Check if role A is higher than role B
   */
  private isHigherRole(roleA: UserRole, roleB?: UserRole): boolean {
    const roleHierarchy = [
      UserRole.SUPER_SUPER_ADMIN, // Highest
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN_EMPLOYEE,
      UserRole.SYSTEM_ADMIN,
      UserRole.HR_ADMIN,
      UserRole.FINANCE_MANAGER,
      UserRole.HR_MANAGER,
      UserRole.DEPARTMENT_HEAD,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.EMPLOYEE,
      UserRole.TRAVEL_ADMIN,
    ];

    if (!roleB) return false;

    const indexA = roleHierarchy.indexOf(roleA);
    const indexB = roleHierarchy.indexOf(roleB);

    return indexA <= indexB; // Lower index = higher role
  }

  /**
   * Log permission changes (in production, this would save to an audit collection)
   */
  private async logPermissionChange(
    performedBy: string,
    targetUserId: string,
    permissions: Record<string, boolean>,
    reason?: string,
  ): Promise<void> {
    // In production, implement proper audit logging
    this.logger.log(
      `Permission change - PerformedBy: ${performedBy}, Target: ${targetUserId}, Changes: ${JSON.stringify(permissions)}, Reason: ${reason}`,
    );
  }

  /**
   * Resend email verification (with 5-day cooldown)
   */
  async resendEmailVerification(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.emailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      // Check if email was sent recently (within 5 days)
      if (
        user.emailVerificationExpires &&
        user.emailVerificationExpires > new Date()
      ) {
        const timeLeft = user.emailVerificationExpires.getTime() - Date.now();
        const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

        if (daysLeft > 0) {
          throw new BadRequestException(
            `Please wait ${daysLeft} day(s) before requesting another verification email`,
          );
        }
      }

      // Resend verification email with new token
      await this.sendEmailVerification(user);

      this.logger.log(`Email verification resent for user: ${user.username}`);

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      this.logger.error(
        `Resend email verification failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send account activation email
   */
  private async sendAccountActivationEmail(user: UserDocument): Promise<void> {
    // TODO: Implement email service
    this.logger.log(`Account activation email sent to: ${user.email}`);
    console.log(
      `Hello ${user.username}, your account has been activated. You can now login to the system.`,
    );
  }

  /**
   * Send account deactivation email
   */
  private async sendAccountDeactivationEmail(
    user: UserDocument,
    reason: string,
  ): Promise<void> {
    // TODO: Implement email service
    this.logger.log(`Account deactivation email sent to: ${user.email}`);
    console.log(
      `Hello ${user.username}, your account has been deactivated. Reason: ${reason}`,
    );
  }

  /**
   * Send account suspension email
   */
  private async sendAccountSuspensionEmail(
    user: UserDocument,
    reason: string,
    suspendUntil?: Date,
  ): Promise<void> {
    // TODO: Implement email service
    this.logger.log(`Account suspension email sent to: ${user.email}`);
    const untilMessage = suspendUntil
      ? ` until ${suspendUntil.toDateString()}`
      : '';
    console.log(
      `Hello ${user.username}, your account has been suspended${untilMessage}. Reason: ${reason}`,
    );
  }

  /**
   * Generate impersonation token (Super Admin only)
   */
  async generateImpersonationToken(
    userId: string,
    impersonatorId: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const impersonator = await this.userModel.findById(impersonatorId);
      if (impersonator?.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only super admins can impersonate users');
      }

      const user = (await this.userModel
        .findById(userId)
        .populate('employeeId')) as UserDocumentWithPopulated;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const employeeId = this.getEmployeeId(user);
      const permissions = await this.getUserPermissions(userId);

      const payload = {
        username: user.username,
        email: user.email,
        sub: user._id.toString(),
        role: user.role,
        employeeId: employeeId,
        permissions: permissions.effectivePermissions,
        impersonatedBy: impersonatorId,
        isImpersonation: true,
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '1h', // Shorter expiry for impersonation tokens
      });

      this.logger.log(
        `Impersonation token generated for user ${userId} by super admin ${impersonatorId}`,
      );

      return {
        accessToken,
        expiresIn: 3600, // 1 hour
      };
    } catch (error) {
      this.logger.error(
        `Generate impersonation token failed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Safely convert Mongoose document to plain object with proper ID handling
   */
  private safeConvertDocument<T extends { _id: any }>(doc: T): any {
    if (!doc) return null;

    const plainObject = (doc as any).toObject
      ? (doc as any).toObject()
      : { ...doc };

    // Ensure _id is properly converted to string
    if (plainObject._id && plainObject._id.toString) {
      plainObject._id = plainObject._id.toString();
    }

    return plainObject;
  }

  /**
   * Safely get ID from Mongoose document
   */
  private safeGetId(doc: any): string {
    if (!doc) return '';

    if (doc._id && doc._id.toString) {
      return doc._id.toString();
    }

    if (typeof doc._id === 'string') {
      return doc._id;
    }

    return '';
  }
}
