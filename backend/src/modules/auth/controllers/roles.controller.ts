import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { UpdateUserRoleDto } from '../dto/manage-permissions.dto';
import { ROLE_HIERARCHY } from '../interfaces/permission.interface';
import { RolesService } from '../services/roles.service';

@ApiTags('Role Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('hierarchy')
  //@Roles(UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPLOYEE, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get role hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Role hierarchy retrieved' })
  getRoleHierarchy() {
    return this.rolesService.getRoleHierarchyTree();
  }

  @Get('users')
  //@Roles(UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPLOYEE, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get all users with roles (Admin view)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getAllUsersWithRoles() {
    return this.rolesService.getAllUsersWithRoles();
  }

  @Post('promote/:userId')
  @Roles(UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPLOYEE, UserRole.HR_ADMIN, UserRole.DEPARTMENT_HEAD)
  @ApiOperation({ summary: 'Promote user to higher role' })
  @ApiParam({ name: 'userId', description: 'User ID to promote' })
  @ApiResponse({ status: 200, description: 'User promoted successfully' })
  async promoteUser(
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    return this.rolesService.promoteUser(
      userId,
      updateRoleDto.newRole,
      req.user.userId,
      updateRoleDto.reason
    );
  }

  @Post('demote/:userId')
  @Roles(UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPLOYEE, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Demote user to lower role' })
  @ApiParam({ name: 'userId', description: 'User ID to demote' })
  @ApiResponse({ status: 200, description: 'User demoted successfully' })
  async demoteUser(
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    // Demotions require a reason
    if (!updateRoleDto.reason) {
      updateRoleDto.reason = 'No reason provided';
    }
    
    return this.rolesService.demoteUser(
      userId,
      updateRoleDto.newRole,
      req.user.userId,
      updateRoleDto.reason
    );
  }

  @Get('permissions/:role')
  @Roles(UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPLOYEE, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get permissions for a specific role' })
  @ApiParam({ name: 'role', description: 'Role to get permissions for' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved' })
  getRolePermissions(@Param('role') role: UserRole) {
    const permissions = this.rolesService.getRolePermissions(role);
    return {
      role,
      permissions,
      total: permissions.length
    };
  }

  @Get('compare-permissions/:roleA/:roleB')
  @Roles(UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPLOYEE)
  @ApiOperation({ summary: 'Compare permissions between two roles' })
  @ApiParam({ name: 'roleA', description: 'First role to compare' })
  @ApiParam({ name: 'roleB', description: 'Second role to compare' })
  @ApiResponse({ status: 200, description: 'Permissions comparison retrieved' })
  compareRolePermissions(
    @Param('roleA') roleA: UserRole,
    @Param('roleB') roleB: UserRole,
  ) {
    return this.rolesService.compareRolePermissions(roleA, roleB);
  }

  @Get('can-manage/:targetRole')
  @Roles(UserRole.SUPER_SUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN_EMPLOYEE, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get roles that can manage a specific role' })
  @ApiParam({ name: 'targetRole', description: 'Target role to check' })
  @ApiResponse({ status: 200, description: 'Manageable roles retrieved' })
  getRolesThatCanManage(@Param('targetRole') targetRole: UserRole) {
    const manageableRoles = ROLE_HIERARCHY
      .filter(role => role.canManageRoles.includes(targetRole))
      .map(role => ({
        role: role.role,
        level: role.level,
        description: role.description
      }));

    return {
      targetRole,
      canBeManagedBy: manageableRoles,
      total: manageableRoles.length
    };
  }

  @Get('my-manageable-roles')
  @ApiOperation({ summary: 'Get roles that current user can manage' })
  @ApiResponse({ status: 200, description: 'Manageable roles retrieved' })
  async getMyManageableRoles(@Request() req: any) {
    const user = req.user;
    const userRole = user.role as UserRole;
    
    const userHierarchy = ROLE_HIERARCHY.find(r => r.role === userRole);
    if (!userHierarchy) {
      return { manageableRoles: [], total: 0 };
    }

    const manageableRoles = userHierarchy.canManageRoles.map(role => {
      const roleInfo = ROLE_HIERARCHY.find(r => r.role === role);
      return {
        role,
        level: roleInfo?.level || 0,
        description: roleInfo?.description || ''
      };
    });

    return {
      userRole,
      manageableRoles,
      total: manageableRoles.length
    };
  }
}