import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,  
  ApiParam, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowType, ApprovalAction } from '../../../common/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';
import { CreateWorkflowInstanceDto } from './dto/create-workflow-instance.dto';
import { ProcessApprovalDto } from './dto/process-approval.dto';

// DTOs for Swagger documentation
class ProcessRejectionDto {
  comments: string;
}

class DelegateApprovalDto {
  delegateToId: string;
  comments?: string;
}

class CancelWorkflowDto {
  reason: string;
}

class CreateDelegationDto {
  delegateToId: string;
  workflowTypes: WorkflowType[];
  startDate: Date;
  endDate: Date;
  reason?: string;
  constraints?: any;
}

@ApiTags('Workflow Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workflow-instances')
export class WorkflowInstancesController {
  constructor(private readonly workflowInstancesService: WorkflowInstancesService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Create a new workflow instance',
    description: 'Create a new workflow instance for various types like leave requests, travel requests, etc.'
  })
  @ApiBody({ type: CreateWorkflowInstanceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Workflow instance created successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async create(
    @Body() createDto: CreateWorkflowInstanceDto,
    @Request() req: any,
  ) {
    const requesterId = req.user?.employeeId || 'system';
    const payload = {
      workflowType: createDto.workflowType,
      requesterId,
      requestData: {
        workflowDefinitionId: createDto.workflowDefinitionId,
        entityType: createDto.entityType,
        entityId: createDto.entityId,
        initialData: createDto.initialData,
        metadata: createDto.metadata,
      },
    };
    return this.workflowInstancesService.createWorkflowInstance(payload);
  }

  @Get('my-workflows')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Get workflow instances for current user',
    description: 'Retrieve workflow instances where the current user is involved as requester or approver'
  })
  @ApiQuery({
    name: 'initiatedByMe',
    required: false,
    type: Boolean,
    description: 'Filter by workflows initiated by the current user'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by workflow status'
  })
  @ApiQuery({
    name: 'workflowType',
    required: false,
    enum: WorkflowType,
    description: 'Filter by workflow type'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow instances retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async getMyWorkflows(
    @Request() req: any,
    @Query('initiatedByMe') initiatedByMe?: string,
    @Query('status') status?: string,
    @Query('workflowType') workflowType?: WorkflowType,
  ) {
    const userId = req.user?.employeeId || 'system';
    
    return this.workflowInstancesService.getWorkflowInstancesForUser(userId, {
      initiatedByMe: initiatedByMe === 'true',
      status,
      workflowType,
    });
  }

  @Get('pending-approvals')
  //@Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Get pending approvals for current user',
    description: 'Retrieve all workflow instances pending approval by the current user (including delegated approvals)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pending approvals retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async getPendingApprovals(@Request() req: any) {
    const userId = req.user?.employeeId || 'system';
    return this.workflowInstancesService.getPendingApprovals(userId);
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Get workflow instance by ID',
    description: 'Retrieve detailed information about a specific workflow instance'
  })
  @ApiParam({
    name: 'id',
    description: 'Workflow instance ID',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow instance retrieved successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow instance not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async findOne(@Param('id') id: string) {
    return this.workflowInstancesService.getWorkflowInstanceById(id);
  }

  @Post(':id/approve')
  //@Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Approve workflow instance',
    description: 'Approve a workflow instance that is pending approval'
  })
  @ApiParam({
    name: 'id',
    description: 'Workflow instance ID',
    type: String
  })
  @ApiBody({ type: ProcessApprovalDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow instance approved successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid approval action' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow instance not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async approve(
    @Param('id') id: string,
    @Body() body: ProcessApprovalDto,
    @Request() req: any,
  ) {
    const approverId = req.user?.employeeId || 'system';
    return this.workflowInstancesService.processApproval(
      id,
      approverId,
      body.action, // Use the action from DTO
      body.comments
    );
  }

  @Post(':id/reject')
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Reject workflow instance',
    description: 'Reject a workflow instance that is pending approval'
  })
  @ApiParam({
    name: 'id',
    description: 'Workflow instance ID',
    type: String
  })
  @ApiBody({ type: ProcessApprovalDto }) // Use the same DTO for consistency
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow instance rejected successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid rejection action' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow instance not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async reject(
    @Param('id') id: string,
    @Body() body: ProcessApprovalDto,
    @Request() req: any,
  ) {
    const approverId = req.user?.employeeId || 'system';
    return this.workflowInstancesService.processApproval(
      id,
      approverId,
      body.action, // Use REJECT action from DTO
      body.comments
    );
  }

  @Post(':id/delegate')
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Delegate workflow approval',
    description: 'Delegate workflow approval responsibility to another user'
  })
  @ApiParam({
    name: 'id',
    description: 'Workflow instance ID',
    type: String
  })
  @ApiBody({ type: DelegateApprovalDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow approval delegated successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid delegation request' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow instance or delegate user not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async delegate(
    @Param('id') id: string,
    @Body() body: DelegateApprovalDto,
    @Request() req: any,
  ) {
    const approverId = req.user?.employeeId || 'system';
    return this.workflowInstancesService.processDelegation(
      id,
      approverId,
      body.delegateToId,
      body.comments
    );
  }

  @Post(':id/cancel')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Cancel workflow instance',
    description: 'Cancel a workflow instance (typically by the requester or admin)'
  })
  @ApiParam({
    name: 'id',
    description: 'Workflow instance ID',
    type: String
  })
  @ApiBody({ type: CancelWorkflowDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow instance cancelled successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid cancellation request' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow instance not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async cancelWorkflow(
    @Param('id') id: string,
    @Body() body: CancelWorkflowDto,
    @Request() req: any,
  ) {
    const cancelledBy = req.user?.employeeId || 'system';
    return this.workflowInstancesService.cancelWorkflowInstance(
      id,
      cancelledBy,
      body.reason
    );
  }

  // Delegation management endpoints
  @Post('delegations')
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Create a new delegation',
    description: 'Create a delegation rule for workflow approvals'
  })
  @ApiBody({ type: CreateDelegationDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Delegation created successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid delegation data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async createDelegation(
    @Body() createDto: CreateDelegationDto,
    @Request() req: any,
  ) {
    return this.workflowInstancesService.createDelegation({
      ...createDto,
      delegatorId: req.user?.employeeId || 'system',
    });
  }

  @Get('delegations/active')
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Get active delegations for current user',
    description: 'Retrieve all active delegations where the current user is the delegator'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active delegations retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async getActiveDelegations(@Request() req: any) {
    const delegatorId = req.user?.employeeId || 'system';
    return this.workflowInstancesService.getActiveDelegations(delegatorId);
  }

  @Post('delegations/:id/revoke')
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.FINANCE_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPER_SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Revoke a delegation',
    description: 'Revoke an active delegation rule'
  })
  @ApiParam({
    name: 'id',
    description: 'Delegation ID',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Delegation revoked successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Delegation not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async revokeDelegation(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const revokedBy = req.user?.employeeId || 'system';
    return this.workflowInstancesService.revokeDelegation(id, revokedBy);
  }
}