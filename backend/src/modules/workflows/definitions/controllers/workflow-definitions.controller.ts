import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';
import { WorkflowDefinitionsService } from '../services/workflow-definitions.service';
import { CreateWorkflowDefinitionDto } from '../dto/create-workflow-definition.dto';
import { UpdateWorkflowDefinitionDto } from '../dto/update-workflow-definition.dto';
import { WorkflowDefinitionResponseDto } from '../dto/workflow-definition-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/schemas/user.schema';

// Query DTO for Swagger documentation
class SearchWorkflowDefinitionsQueryDto {
  workflowType?: string;
  department?: string;
  isActive?: boolean;
}

@ApiTags('Workflow Definitions')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized - Missing or invalid token' })
@ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workflow-definitions')
export class WorkflowDefinitionsController {
  constructor(
    private readonly workflowDefinitionsService: WorkflowDefinitionsService,
  ) {}

  @Post()
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN, 
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER
  )
  @ApiOperation({ 
    summary: 'Create a new workflow definition',
    description: 'Create a new workflow definition with stages and approval rules. Requires admin privileges.'
  })
  @ApiBody({ type: CreateWorkflowDefinitionDto })
  @ApiResponse({
    status: 201,
    description: 'Workflow definition created successfully',
    type: WorkflowDefinitionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  async create(
    @Body() createDto: CreateWorkflowDefinitionDto,
    @Request() req: any,
  ): Promise<WorkflowDefinitionResponseDto> {
    return this.workflowDefinitionsService.create(createDto, req.user?.userId || 'system');
  }

  @Get()
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER
  )
  @ApiOperation({ 
    summary: 'Get all workflow definitions',
    description: 'Retrieve all workflow definitions with pagination and filtering options.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Page number for pagination' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Number of items per page' 
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow definitions retrieved successfully',
    type: [WorkflowDefinitionResponseDto],
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<WorkflowDefinitionResponseDto[]> {
    return this.workflowDefinitionsService.findAll();
  }

  @Get('search')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER
  )
  @ApiOperation({ 
    summary: 'Search workflow definitions',
    description: 'Search workflow definitions by type, department, and active status.'
  })
  @ApiQuery({ 
    name: 'workflowType', 
    required: false, 
    type: String,
    description: 'Filter by workflow type (e.g., LEAVE_REQUEST, TRAVEL_REQUEST)' 
  })
  @ApiQuery({ 
    name: 'department', 
    required: false, 
    type: String,
    description: 'Filter by department ID or name' 
  })
  @ApiQuery({ 
    name: 'isActive', 
    required: false, 
    type: Boolean,
    description: 'Filter by active status' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: [WorkflowDefinitionResponseDto] 
  })
  async search(
    @Query('workflowType') workflowType?: string,
    @Query('department') department?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<WorkflowDefinitionResponseDto[]> {
    return this.workflowDefinitionsService.search({
      workflowType,
      department,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    });
  }

  @Get('active/:workflowType')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER,
    UserRole.SUPERVISOR,
    UserRole.EMPLOYEE
  )
  @ApiOperation({ 
    summary: 'Get active workflow definition by type',
    description: 'Retrieve the currently active workflow definition for a specific workflow type.'
  })
  @ApiParam({ 
    name: 'workflowType', 
    type: String,
    description: 'Workflow type (e.g., LEAVE_REQUEST, TRAVEL_REQUEST)' 
  })
  @ApiQuery({ 
    name: 'department', 
    required: false, 
    type: String,
    description: 'Department ID for department-specific workflows' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active workflow definition retrieved successfully',
    type: WorkflowDefinitionResponseDto 
  })
  @ApiNotFoundResponse({ 
    description: 'No active workflow definition found for the specified type and department' 
  })
  async getActiveDefinition(
    @Param('workflowType') workflowType: string,
    @Query('department') department?: string,
  ): Promise<WorkflowDefinitionResponseDto> {
    const definition = await this.workflowDefinitionsService.getActiveDefinition(
      workflowType as any,
      department,
    );

    if (!definition) {
      throw new NotFoundException(
        `No active workflow definition found for type: ${workflowType}` + 
        (department ? ` and department: ${department}` : '')
      );
    }

    return this.workflowDefinitionsService.mapToResponseDto(definition);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER
  )
  @ApiOperation({ 
    summary: 'Get workflow definition by ID',
    description: 'Retrieve detailed information about a specific workflow definition including stages and approval rules.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'Workflow definition ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow definition retrieved successfully',
    type: WorkflowDefinitionResponseDto 
  })
  @ApiNotFoundResponse({ 
    description: 'Workflow definition not found' 
  })
  async findOne(@Param('id') id: string): Promise<WorkflowDefinitionResponseDto> {
    return this.workflowDefinitionsService.findOne(id);
  }

  @Put(':id')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER
  )
  @ApiOperation({ 
    summary: 'Update workflow definition',
    description: 'Update an existing workflow definition. This may create a new version if major changes are made.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'Workflow definition ID' 
  })
  @ApiBody({ type: UpdateWorkflowDefinitionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow definition updated successfully',
    type: WorkflowDefinitionResponseDto 
  })
  @ApiNotFoundResponse({ 
    description: 'Workflow definition not found' 
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data'
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkflowDefinitionDto,
    @Request() req: any,
  ): Promise<WorkflowDefinitionResponseDto> {
    return this.workflowDefinitionsService.update(id, updateDto, req.user?.userId || 'system');
  }

  @Delete(':id')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN
  )
  @ApiOperation({ 
    summary: 'Delete workflow definition',
    description: 'Permanently delete a workflow definition. This action is irreversible and should be used with caution.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'Workflow definition ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow definition deleted successfully' 
  })
  @ApiNotFoundResponse({ 
    description: 'Workflow definition not found' 
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete active workflow definition'
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.workflowDefinitionsService.remove(id);
  }

  @Post(':id/activate')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER
  )
  @ApiOperation({ 
    summary: 'Activate workflow definition',
    description: 'Activate a workflow definition. This will deactivate other definitions of the same type and department.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'Workflow definition ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow definition activated successfully',
    type: WorkflowDefinitionResponseDto 
  })
  @ApiNotFoundResponse({ 
    description: 'Workflow definition not found' 
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot activate invalid workflow definition'
  })
  async activate(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<WorkflowDefinitionResponseDto> {
    return this.workflowDefinitionsService.activate(id, req.user?.userId || 'system');
  }

  @Post(':id/deactivate')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER
  )
  @ApiOperation({ 
    summary: 'Deactivate workflow definition',
    description: 'Deactivate a workflow definition. This will make it unavailable for new workflow instances.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'Workflow definition ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow definition deactivated successfully',
    type: WorkflowDefinitionResponseDto 
  })
  @ApiNotFoundResponse({ 
    description: 'Workflow definition not found' 
  })
  async deactivate(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<WorkflowDefinitionResponseDto> {
    return this.workflowDefinitionsService.deactivate(id, req.user?.userId || 'system');
  }

  @Get(':id/versions')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER
  )
  @ApiOperation({ 
    summary: 'Get all versions of a workflow definition',
    description: 'Retrieve all historical versions of a workflow definition for audit and comparison purposes.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'Workflow definition ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow definition versions retrieved successfully',
    type: [WorkflowDefinitionResponseDto] 
  })
  @ApiNotFoundResponse({ 
    description: 'Workflow definition not found' 
  })
  async getVersions(@Param('id') id: string): Promise<WorkflowDefinitionResponseDto[]> {
    const definition = await this.workflowDefinitionsService.findOne(id);

    return this.workflowDefinitionsService.search({
      workflowType: definition.workflowType,
      department: definition.department,
    });
  }

  @Get('types/available')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER,
    UserRole.SUPERVISOR,
    UserRole.EMPLOYEE
  )
  @ApiOperation({ 
    summary: 'Get available workflow types',
    description: 'Retrieve all available workflow types in the system.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Available workflow types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        types: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getAvailableWorkflowTypes(): Promise<{ types: Array<{ value: string; label: string; description: string }> }> {
    // This would typically come from an enum or configuration
    const types = [
      { value: 'LEAVE_REQUEST', label: 'Leave Request', description: 'Employee leave approval workflow' },
      { value: 'TRAVEL_REQUEST', label: 'Travel Request', description: 'Business travel approval workflow' },
      { value: 'EXPENSE_CLAIM', label: 'Expense Claim', description: 'Expense reimbursement approval workflow' },
      { value: 'OVERTIME_CLAIM', label: 'Overtime Claim', description: 'Overtime compensation approval workflow' },
      { value: 'LOAN_APPLICATION', label: 'Loan Application', description: 'Employee loan approval workflow' },
      { value: 'RECRUITMENT', label: 'Recruitment', description: 'Employee recruitment approval workflow' },
      { value: 'PERFORMANCE_REVIEW', label: 'Performance Review', description: 'Employee performance review workflow' },
    ];

    return { types };
  }
}