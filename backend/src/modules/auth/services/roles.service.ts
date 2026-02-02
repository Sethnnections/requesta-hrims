/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import {
  Employee,
  EmployeeDocument,
} from '../../employees/schemas/employee.schema';
import {
  SYSTEM_PERMISSIONS,
  ROLE_HIERARCHY,
  Permission,
} from '../interfaces/permission.interface';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  /**
   * Check if user can manage target role
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerHierarchy = ROLE_HIERARCHY.find((r) => r.role === managerRole);
    if (!managerHierarchy) return false;

    return managerHierarchy.canManageRoles.includes(targetRole);
  }

  /**
   * Promote user to higher role
   */
  async promoteUser(
    targetUserId: string,
    newRole: UserRole,
    promotedBy: string,
    reason?: string,
  ): Promise<{ message: string; oldRole: UserRole; newRole: UserRole }> {
    const promoter = await this.userModel.findById(promotedBy);
    const targetUser = await this.userModel.findById(targetUserId);

    if (!promoter || !targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if promoter can manage target's current role
    if (!this.canManageRole(promoter.role, targetUser.role)) {
      throw new ForbiddenException('You cannot manage users with this role');
    }

    // Check if new role is in promoter's manageable roles
    if (!this.canManageRole(promoter.role, newRole)) {
      throw new ForbiddenException('You cannot assign this role');
    }

    const oldRole = targetUser.role;

    // Update user role
    targetUser.role = newRole;
    targetUser.updatedBy = promotedBy;
    await targetUser.save();

    // Update employee system role
    await this.employeeModel.findOneAndUpdate(
      { userId: targetUserId },
      { systemRole: newRole },
    );

    // Log role change
    await this.logRoleChange(
      promotedBy,
      targetUserId,
      oldRole,
      newRole,
      'PROMOTION',
      reason,
    );

    this.logger.log(
      `User ${targetUserId} promoted from ${oldRole} to ${newRole} by ${promotedBy}`,
    );

    return {
      message: `User promoted from ${oldRole} to ${newRole}`,
      oldRole,
      newRole,
    };
  }

  /**
   * Demote user to lower role
   */
  async demoteUser(
    targetUserId: string,
    newRole: UserRole,
    demotedBy: string,
    reason: string,
  ): Promise<{ message: string; oldRole: UserRole; newRole: UserRole }> {
    const demoter = await this.userModel.findById(demotedBy);
    const targetUser = await this.userModel.findById(targetUserId);

    if (!demoter || !targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if demoter can manage target's current role
    if (!this.canManageRole(demoter.role, targetUser.role)) {
      throw new ForbiddenException('You cannot manage users with this role');
    }

    // Check if new role is lower in hierarchy
    const oldLevel =
      ROLE_HIERARCHY.find((r) => r.role === targetUser.role)?.level || 0;
    const newLevel = ROLE_HIERARCHY.find((r) => r.role === newRole)?.level || 0;

    if (newLevel >= oldLevel) {
      throw new BadRequestException(
        'New role must be lower in hierarchy than current role',
      );
    }

    // Check if demoter can manage new role
    if (!this.canManageRole(demoter.role, newRole)) {
      throw new ForbiddenException('You cannot assign this role');
    }

    const oldRole = targetUser.role;

    // Update user role
    targetUser.role = newRole;
    targetUser.updatedBy = demotedBy;
    await targetUser.save();

    // Update employee system role
    await this.employeeModel.findOneAndUpdate(
      { userId: targetUserId },
      { systemRole: newRole },
    );

    // Log role change
    await this.logRoleChange(
      demotedBy,
      targetUserId,
      oldRole,
      newRole,
      'DEMOTION',
      reason,
    );

    this.logger.log(
      `User ${targetUserId} demoted from ${oldRole} to ${newRole} by ${demotedBy}`,
    );

    return {
      message: `User demoted from ${oldRole} to ${newRole}`,
      oldRole,
      newRole,
    };
  }

  /**
   * Get all users with their roles (for admin view)
   */
  async getAllUsersWithRoles(): Promise<any[]> {
    const users = await this.userModel
      .find()
      .populate(
        'employeeId',
        'employeeNumber firstName lastName email departmentId positionId',
      )
      .select('-password -refreshToken')
      .sort({ role: 1, createdAt: -1 })
      .exec();

    return users.map((user) => ({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      employee: user.employeeId,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      manageableBy: this.getRolesThatCanManage(user.role),
    }));
  }

  /**
   * Get roles that can manage a specific role
   */
  private getRolesThatCanManage(targetRole: UserRole): UserRole[] {
    return ROLE_HIERARCHY.filter((role) =>
      role.canManageRoles.includes(targetRole),
    ).map((role) => role.role as UserRole);
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: UserRole): Permission[] {
    return SYSTEM_PERMISSIONS.filter((permission) =>
      permission.allowedRoles.includes(role),
    );
  }

  /**
   * Compare role permissions
   */
  compareRolePermissions(
    roleA: UserRole,
    roleB: UserRole,
  ): {
    roleAOnly: Permission[];
    roleBOnly: Permission[];
    common: Permission[];
  } {
    const permissionsA = this.getRolePermissions(roleA);
    const permissionsB = this.getRolePermissions(roleB);

    const roleAOnly = permissionsA.filter(
      (pA) => !permissionsB.some((pB) => pB.id === pA.id),
    );

    const roleBOnly = permissionsB.filter(
      (pB) => !permissionsA.some((pA) => pA.id === pB.id),
    );

    const common = permissionsA.filter((pA) =>
      permissionsB.some((pB) => pB.id === pA.id),
    );

    return { roleAOnly, roleBOnly, common };
  }

  /**
   * Get role hierarchy tree
   */
  getRoleHierarchyTree(): any {
    const hierarchyMap = new Map<string, any>();

    // Create nodes
    ROLE_HIERARCHY.forEach((role) => {
      hierarchyMap.set(role.role, {
        ...role,
        children: [],
      });
    });

    // Build tree
    const tree: any[] = [];
    ROLE_HIERARCHY.forEach((role) => {
      const node = hierarchyMap.get(role.role);
      if (role.parentRole) {
        const parent = hierarchyMap.get(role.parentRole);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  /**
   * Log role change (in production, save to audit collection)
   */
  private async logRoleChange(
    performedBy: string,
    targetUserId: string,
    oldRole: UserRole,
    newRole: UserRole,
    action: 'PROMOTION' | 'DEMOTION' | 'TRANSFER',
    reason?: string,
  ): Promise<void> {
    // In production, save to audit collection
    this.logger.log(
      `Role change - Action: ${action}, PerformedBy: ${performedBy}, Target: ${targetUserId}, OldRole: ${oldRole}, NewRole: ${newRole}, Reason: ${reason}`,
    );

    // Send notification email
    await this.sendRoleChangeNotification(
      targetUserId,
      oldRole,
      newRole,
      action,
      reason,
    );
  }

  /**
   * Send role change notification
   */
  private async sendRoleChangeNotification(
    userId: string,
    oldRole: UserRole,
    newRole: UserRole,
    action: 'PROMOTION' | 'DEMOTION' | 'TRANSFER',
    reason?: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).populate('employeeId');
    if (!user) return;

    // TODO: Implement email service
    this.logger.log(`Role change notification sent to: ${user.email}`);
    console.log(
      `Dear ${user.username}, your role has been changed from ${oldRole} to ${newRole}. Action: ${action}. Reason: ${reason || 'No reason provided'}`,
    );
  }
}
