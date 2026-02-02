import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from 'src/common/enums';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { SYSTEM_PERMISSIONS } from '../interfaces/permission.interface';
import { AuthService } from '../services/auth.service';


@ApiTags('Authentication - Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auth/permissions')
export class PermissionsController {
  constructor(private readonly authService: AuthService) {}

  @Get('system')
  //@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get all system permissions' })
  @ApiResponse({ status: 200, description: 'System permissions retrieved' })
  getSystemPermissions() {
    return {
      permissions: SYSTEM_PERMISSIONS,
      total: SYSTEM_PERMISSIONS.length
    };
  }

  @Get('user/:userId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user permissions (Super Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID to get permissions for' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Only super admins can view user permissions' })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.authService.getUserPermissions(userId);
  }

  @Put('user/:userId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user permissions (Super Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID to update permissions for' })
  @ApiResponse({ status: 200, description: 'User permissions updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid permissions provided' })
  @ApiResponse({ status: 403, description: 'Only super admins can update permissions' })
  async updateUserPermissions(
    @Param('userId') userId: string,
    @Body() permissions: Record<string, boolean>,
    @Request() req: any,
  ) {
    return this.authService.updateUserPermissions(userId, permissions, req.user.userId);
  }

  @Get('my-permissions')
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved' })
  async getMyPermissions(@Request() req: any) {
    return this.authService.getUserPermissions(req.user.userId);
  }

  @Get('role/:role')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get permissions for a specific role' })
  @ApiParam({ name: 'role', description: 'Role to get permissions for' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved' })
  @ApiResponse({ status: 400, description: 'Invalid role' })
  getRolePermissions(@Param('role') role: UserRole) {
    const rolePermissions = SYSTEM_PERMISSIONS
      .filter(permission => permission.allowedRoles.includes(role))
      .map(permission => ({
        module: permission.module,
        action: permission.action,
        description: permission.description
      }));

    return {
      role,
      permissions: rolePermissions,
      total: rolePermissions.length
    };
  }

  @Get('available-permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all available permission keys' })
  @ApiResponse({ status: 200, description: 'Available permissions retrieved' })
  getAvailablePermissions() {
    const permissionKeys = SYSTEM_PERMISSIONS.map(p => `${p.module}:${p.action}`);
    return {
      permissions: permissionKeys,
      total: permissionKeys.length
    };
  }
}