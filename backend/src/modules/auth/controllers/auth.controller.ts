import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Get,
  Patch,
  Put,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { UserRole, LoginMethod } from '../schemas/user.schema';
import {
  ManageUserPermissionsDto,
  UpdateUserRoleDto,
  BulkPermissionsUpdateDto,
} from '../dto/manage-permissions.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with email or username' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked or inactive' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.HR_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN_EMPLOYEE,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user account for employee (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ): Promise<any> {
    return this.authService.createUser(createUserDto, req.user.userId);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() body: { refreshToken: string },
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req: any): Promise<{ message: string }> {
    await this.authService.logout(req.user.userId);
    return { message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req: any): Promise<any> {
    return this.authService.getUserProfile(req.user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async updateProfile(
    @Body()
    updateData: {
      username?: string;
      email?: string;
      phoneNumber?: string;
      profilePicture?: string;
      loginMethod?: LoginMethod;
    },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.updateProfile(req.user.userId, updateData);
  }

  @Post('validate-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate user session' })
  @ApiResponse({ status: 200, description: 'Session is valid' })
  @ApiResponse({ status: 401, description: 'Session expired' })
  async validateSession(
    @Request() req: any,
  ): Promise<{ valid: boolean; message: string }> {
    const isValid = await this.authService.validateSession(req.user.userId);
    if (!isValid) {
      throw new UnauthorizedException('Session expired due to inactivity');
    }
    return { valid: true, message: 'Session is valid' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ApiResponse({
    status: 400,
    description: 'New password does not meet requirements',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Reset instructions sent if email exists',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(
    @Body() body: { token: string },
  ): Promise<{ message: string }> {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(@Request() req: any): Promise<{ message: string }> {
    // This would typically call an email service to resend verification
    const user = await this.authService.getUserProfile(req.user.userId);
    // In a real implementation, you would resend the verification email here
    return { message: 'Verification email sent successfully' };
  }

  @Get('password-policy')
  @ApiOperation({ summary: 'Get password policy requirements' })
  @ApiResponse({ status: 200, description: 'Password policy retrieved' })
  async getPasswordPolicy() {
    return this.authService.getPasswordPolicy();
  }

  @Get('check-password-change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if password change is required' })
  @ApiResponse({
    status: 200,
    description: 'Password change requirement status',
  })
  async checkPasswordChangeRequired(
    @Request() req: any,
  ): Promise<{ requiresChange: boolean }> {
    const requiresChange = await this.authService.checkPasswordChangeRequired(
      req.user.userId,
    );
    return { requiresChange };
  }

  @Get('permissions/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved' })
  async getMyPermissions(@Request() req: any) {
    return this.authService.getUserPermissions(req.user.userId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Patch('admin/force-password-change/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Force password change for user' })
  @ApiParam({
    name: 'userId',
    description: 'User ID to force password change for',
  })
  @ApiResponse({
    status: 200,
    description: 'Password change forced successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async adminForcePasswordChange(
    @Param('userId') userId: string,
    @Body() body: { newPassword: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.forcePasswordChange(userId, body.newPassword);
  }

  @Post('admin/require-password-change/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Require password change on next login' })
  @ApiParam({
    name: 'userId',
    description: 'User ID to require password change for',
  })
  @ApiResponse({ status: 200, description: 'Password change requirement set' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async adminRequirePasswordChange(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.setMustChangePassword(userId);
  }

  @Get('admin/user/:userId/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super Admin: Get user permissions' })
  @ApiParam({ name: 'userId', description: 'User ID to get permissions for' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Only super admins can view user permissions',
  })
  async adminGetUserPermissions(@Param('userId') userId: string) {
    return this.authService.getUserPermissions(userId);
  }

  @Put('admin/user/:userId/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super Admin: Update user permissions' })
  @ApiParam({
    name: 'userId',
    description: 'User ID to update permissions for',
  })
  @ApiResponse({
    status: 200,
    description: 'User permissions updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid permissions provided' })
  @ApiResponse({
    status: 403,
    description: 'Only super admins can update permissions',
  })
  async adminUpdateUserPermissions(
    @Param('userId') userId: string,
    @Body() permissions: Record<string, boolean>,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.updateUserPermissions(
      userId,
      permissions,
      req.user.userId,
    );
  }

  @Get('admin/user/:userId/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get user profile (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID to get profile for' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async adminGetUserProfile(@Param('userId') userId: string) {
    return this.authService.getUserProfile(userId);
  }

  @Put('admin/user/:userId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update user status' })
  @ApiParam({ name: 'userId', description: 'User ID to update status for' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async adminUpdateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: UserRole; reason?: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    // This would typically update user status in the database
    // For now, return a success message
    return { message: `User status updated to ${body.status} by admin` };
  }

  @Get('admin/organization-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.HR_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization data status' })
  @ApiResponse({ status: 200, description: 'Organization status retrieved' })
  async getOrganizationStatus(): Promise<{
    departments: number;
    grades: number;
    positions: number;
    employees: number;
    users: number;
  }> {
    return this.authService.getOrganizationStatus();
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async adminGetAllUsers(
    @Query() query: { page?: number; limit?: number },
  ): Promise<{ users: any[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    return this.authService.getAllUsers(page, limit);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Query() query: { page?: number; limit?: number },
  ): Promise<{ users: any[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    return this.authService.getAllUsers(page, limit);
  }

  @Post('admin/user/:userId/impersonate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super Admin: Impersonate user (for support)' })
  @ApiParam({ name: 'userId', description: 'User ID to impersonate' })
  @ApiResponse({ status: 200, description: 'Impersonation token generated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Only super admins can impersonate users',
  })
  async adminImpersonateUser(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    // This would generate a special impersonation token
    // For now, return a mock response
    return {
      accessToken: 'impersonation_token_here',
      expiresIn: 3600,
    };
  }

  // ==================== WORKFLOW MANAGEMENT ENDPOINTS ====================

  @Get('admin/workflow-permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
 // @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get workflow permissions configuration' })
  @ApiResponse({ status: 200, description: 'Workflow permissions retrieved' })
  async getWorkflowPermissions() {
    // This would return workflow-specific permissions and configurations
    return {
      workflows: [
        {
          name: 'leave_approval',
          description: 'Leave Request Approval Workflow',
          permissions: ['leave:approve', 'leave:reject', 'leave:escalate'],
          roles: ['manager', 'department_head', 'hr_manager'],
        },
        {
          name: 'loan_approval',
          description: 'Loan Application Approval Workflow',
          permissions: ['loan:approve', 'loan:reject', 'loan:recommend'],
          roles: ['manager', 'finance_manager', 'hr_manager'],
        },
      ],
    };
  }

  @Put('admin/workflow-permissions/:workflowId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super Admin: Update workflow permissions' })
  @ApiParam({ name: 'workflowId', description: 'Workflow ID to update' })
  @ApiResponse({ status: 200, description: 'Workflow permissions updated' })
  async updateWorkflowPermissions(
    @Param('workflowId') workflowId: string,
    @Body() permissions: any,
    @Request() req: any,
  ): Promise<{ message: string }> {
    // This would update workflow permissions in the database
    return {
      message: `Workflow ${workflowId} permissions updated successfully`,
    };
  }

  // ==================== SYSTEM CONFIGURATION ENDPOINTS ====================

  @Get('admin/system-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
 //[] @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({ status: 200, description: 'System configuration retrieved' })
  async getSystemConfig() {
    return {
      authentication: {
        loginMethods: ['username', 'email', 'both'],
        defaultLoginMethod: 'both',
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
        },
        twoFactorAuth: false,
      },
      notifications: {
        emailVerification: true,
        passwordReset: true,
        securityAlerts: true,
      },
    };
  }

  @Put('admin/system-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super Admin: Update system configuration' })
  @ApiResponse({ status: 200, description: 'System configuration updated' })
  async updateSystemConfig(
    @Body() config: any,
    @Request() req: any,
  ): Promise<{ message: string }> {
    // This would update system configuration in the database
    return { message: 'System configuration updated successfully' };
  }

  // Account Management Endpoints
  @Patch('admin/users/:userId/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Activate user account' })
  @ApiParam({ name: 'userId', description: 'User ID to activate' })
  @ApiResponse({
    status: 200,
    description: 'User account activated successfully',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUserAccount(
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.activateUserAccount(
      userId,
      req.user.userId,
      body.reason,
    );
  }

  @Patch('admin/users/:userId/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Deactivate user account' })
  @ApiParam({ name: 'userId', description: 'User ID to deactivate' })
  @ApiResponse({
    status: 200,
    description: 'User account deactivated successfully',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUserAccount(
    @Param('userId') userId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.deactivateUserAccount(
      userId,
      req.user.userId,
      body.reason,
    );
  }

  @Patch('admin/users/:userId/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Suspend user account' })
  @ApiParam({ name: 'userId', description: 'User ID to suspend' })
  @ApiResponse({
    status: 200,
    description: 'User account suspended successfully',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async suspendUserAccount(
    @Param('userId') userId: string,
    @Body() body: { reason: string; suspendUntil?: Date },
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.suspendUserAccount(
      userId,
      req.user.userId,
      body.reason,
      body.suspendUntil,
    );
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend email verification (5-day cooldown)' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified or cooldown active',
  })
  async resendEmailVerification(
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.resendEmailVerification(req.user.userId);
  }

  // Employee Statistics Endpoints
  @Get('admin/employee-statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive employee statistics' })
  @ApiResponse({
    status: 200,
    description: 'Employee statistics retrieved successfully',
  })
  async getEmployeeStatistics(): Promise<any> {
    // This would call the EmployeeStatisticsService
    // For now, return mock data or implement the service
    return { message: 'Employee statistics endpoint' };
  }

  @Get('admin/department-statistics/:departmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department-specific employee statistics' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department statistics retrieved successfully',
  })
  async getDepartmentStatistics(
    @Param('departmentId') departmentId: string,
  ): Promise<any> {
    // This would call the EmployeeStatisticsService
    return { message: 'Department statistics endpoint', departmentId };
  } // ==================== PERMISSION MANAGEMENT ENDPOINTS ====================

  @Post('admin/permissions/manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN_EMPLOYEE,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Manage user permissions (Super Super Admin, Super Admin, Admin Employee)',
  })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async manageUserPermissions(
    @Body() managePermissionsDto: ManageUserPermissionsDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.manageUserPermissions(
      managePermissionsDto.userId,
      managePermissionsDto.permissions,
      req.user.userId,
      managePermissionsDto.reason,
    );
  }

  @Put('admin/users/:userId/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role (Super Super Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID to update role for' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Only super super admins can change roles',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.authService.updateUserRole(
      userId,
      updateRoleDto.newRole,
      req.user.userId,
      updateRoleDto.reason,
    );
  }

  @Post('admin/permissions/bulk-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN_EMPLOYEE,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update user permissions' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async bulkUpdatePermissions(
    @Body() bulkUpdateDto: BulkPermissionsUpdateDto,
    @Request() req: any,
  ): Promise<{ message: string; results: any[] }> {
    return this.authService.bulkUpdatePermissions(
      bulkUpdateDto.updates,
      req.user.userId,
      bulkUpdateDto.reason,
    );
  }

  @Get('admin/permissions/audit/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN_EMPLOYEE,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user permission audit log' })
  @ApiParam({ name: 'userId', description: 'User ID to get audit log for' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getPermissionAuditLog(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<any[]> {
    return this.authService.getPermissionAuditLog(userId, req.user.userId);
  }

  @Get('admin/permissions/hierarchy')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN_EMPLOYEE,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get role hierarchy and permissions structure' })
  @ApiResponse({ status: 200, description: 'Role hierarchy retrieved' })
  async getRoleHierarchy(): Promise<any> {
    return {
      hierarchy: [
        {
          role: 'super_super_admin',
          level: 1,
          description:
            'Full system access, can manage all users including super admins',
        },
        {
          role: 'super_admin',
          level: 2,
          description:
            'Full system access, can manage all users except super super admins',
        },
        {
          role: 'admin_employee',
          level: 3,
          description:
            'Admin who is also employee, can manage permissions and users',
        },
        {
          role: 'system_admin',
          level: 4,
          description: 'System administration access',
        },
        { role: 'hr_admin', level: 5, description: 'HR administration access' },
        {
          role: 'finance_manager',
          level: 6,
          description: 'Finance management access',
        },
        { role: 'hr_manager', level: 7, description: 'HR management access' },
        {
          role: 'department_head',
          level: 8,
          description: 'Department head access',
        },
        { role: 'manager', level: 9, description: 'Manager access' },
        { role: 'supervisor', level: 10, description: 'Supervisor access' },
        { role: 'employee', level: 11, description: 'Employee access' },
        {
          role: 'travel_admin',
          level: 12,
          description: 'Travel administration access',
        },
      ],
      permissionManagement: {
        super_super_admin: 'Can manage all roles and permissions',
        super_admin: 'Can manage all roles except super_super_admin',
        admin_employee: 'Can manage permissions for roles below admin_employee',
      },
    };
  }

  @Post('debug/verify')
  @ApiOperation({ summary: 'Debug: Verify token manually' })
  async debugVerifyToken(@Body() body: { token: string }) {
    try {
      const jwtService = this.authService['jwtService'];
      const decoded = jwtService.verify(body.token);

      return {
        valid: true,
        decoded,
        currentTime: new Date().toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        currentTime: new Date().toISOString(),
      };
    }
  }

  @Get('debug/test-guard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async debugTestGuard(@Request() req: any) {
    return {
      message: 'JWT Guard is working!',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }
}
