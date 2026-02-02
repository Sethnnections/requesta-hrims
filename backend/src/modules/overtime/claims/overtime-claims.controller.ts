import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  Patch,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OvertimeClaimsService } from './overtime-claims.service';
import { CreateOvertimeClaimDto } from './dto/create-overtime-claim.dto';
import { OvertimeClaimResponseDto } from './dto/overtime-claim-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';
import { ClaimStatus, OvertimeType } from '../../../common/enums';

@ApiTags('Overtime Claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('overtime/claims')
export class OvertimeClaimsController {
  constructor(
    private readonly overtimeClaimsService: OvertimeClaimsService,
  ) {}

  @Post()
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Create a new overtime claim',
    description: 'Submit a new overtime claim which will automatically calculate payments and initiate approval workflow based on grade-based rules.'
  })
  @ApiBody({ type: CreateOvertimeClaimDto })
  @ApiResponse({
    status: 201,
    description: 'Overtime claim created successfully',
    type: OvertimeClaimResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or validation error'
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found'
  })
  async create(
    @Body() createDto: CreateOvertimeClaimDto,
    @Request() req: any,
  ): Promise<OvertimeClaimResponseDto> {
    return this.overtimeClaimsService.create(createDto, req.user?.userId || 'system');
  }

  @Get()
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER,
    UserRole.SUPERVISOR,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get all overtime claims',
    description: 'Retrieve overtime claims with optional filtering. Employees can only see their own claims.'
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    type: String,
    description: 'Filter by employee ID'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by claim status'
  })
  @ApiQuery({
    name: 'overtimeType',
    required: false,
    enum: OvertimeType,
    description: 'Filter by overtime type'
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: String,
    description: 'Filter by department ID'
  })
  @ApiQuery({
    name: 'projectCode',
    required: false,
    type: String,
    description: 'Filter by project code'
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Filter by claim date from'
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Filter by claim date to'
  })
  @ApiQuery({
    name: 'supervisorConfirmed',
    required: false,
    type: Boolean,
    description: 'Filter by supervisor confirmation status'
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime claims retrieved successfully',
    type: [OvertimeClaimResponseDto],
  })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('overtimeType') overtimeType?: OvertimeType,
    @Query('departmentId') departmentId?: string,
    @Query('projectCode') projectCode?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('supervisorConfirmed') supervisorConfirmed?: string,
    @Request() req?: any,
  ): Promise<OvertimeClaimResponseDto[]> {
    // If user is employee, only show their own claims
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    let filters: any = {};
    if (userRole === UserRole.EMPLOYEE) {
      filters.employeeId = userId;
    } else {
      if (employeeId) filters.employeeId = employeeId;
      if (departmentId) filters.departmentId = departmentId;
    }

    if (status) filters.status = status;
    if (overtimeType) filters.overtimeType = overtimeType;
    if (projectCode) filters.projectCode = projectCode;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    if (supervisorConfirmed !== undefined) {
      filters.supervisorConfirmed = supervisorConfirmed === 'true';
    }

    return this.overtimeClaimsService.findAll(filters);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER,
    UserRole.SUPERVISOR,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get overtime claim by ID',
    description: 'Retrieve detailed information about a specific overtime claim including payment calculations.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Overtime claim ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime claim retrieved successfully',
    type: OvertimeClaimResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Overtime claim not found'
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<OvertimeClaimResponseDto> {
    const claim = await this.overtimeClaimsService.findOne(id);

    // Check if employee can access this claim
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && claim.employeeId !== userId) {
      throw new NotFoundException('Overtime claim not found');
    }

    return claim;
  }

  @Get('reference/:reference')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER,
    UserRole.SUPERVISOR,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get overtime claim by reference',
    description: 'Retrieve detailed information about a specific overtime claim using claim reference.'
  })
  @ApiParam({
    name: 'reference',
    type: String,
    description: 'Claim reference (e.g., OVT-2025-11-0001)'
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime claim retrieved successfully',
    type: OvertimeClaimResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Overtime claim not found'
  })
  async findByReference(
    @Param('reference') reference: string,
    @Request() req: any,
  ): Promise<OvertimeClaimResponseDto> {
    const claim = await this.overtimeClaimsService.findByReference(reference);

    // Check if employee can access this claim
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && claim.employeeId !== userId) {
      throw new NotFoundException('Overtime claim not found');
    }

    return claim;
  }

  @Patch(':id/confirm')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER,
    UserRole.SUPERVISOR
  )
  @ApiOperation({
    summary: 'Confirm overtime claim by supervisor',
    description: 'Supervisor confirms the validity of overtime hours worked.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Overtime claim ID'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'string',
          description: 'Confirmation comments'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime claim confirmed successfully',
    type: OvertimeClaimResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Overtime claim not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot confirm claim in current status or user is not authorized'
  })
  async confirmBySupervisor(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Request() req: any,
  ): Promise<OvertimeClaimResponseDto> {
    return this.overtimeClaimsService.confirmBySupervisor(
      id,
      req.user?.userId || 'system',
      comments
    );
  }

  @Post('process-payroll')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.PAYROLL_ADMIN
  )
  @ApiOperation({
    summary: 'Process approved overtime claims for payroll',
    description: 'Mark approved overtime claims as processed for specific payroll period.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        claimIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of claim IDs to process'
        },
        payrollPeriod: {
          type: 'string',
          description: 'Payroll period in YYYY-MM format',
          example: '2025-11'
        }
      },
      required: ['claimIds', 'payrollPeriod']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime claims processed successfully',
    type: [OvertimeClaimResponseDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or claims cannot be processed'
  })
  async processForPayroll(
    @Body('claimIds') claimIds: string[],
    @Body('payrollPeriod') payrollPeriod: string,
    @Request() req: any,
  ): Promise<OvertimeClaimResponseDto[]> {
    return this.overtimeClaimsService.processForPayroll(
      claimIds,
      req.user?.userId || 'system',
      payrollPeriod
    );
  }

  @Patch(':id/cancel')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Cancel overtime claim',
    description: 'Cancel an overtime claim that is in draft or pending approval status.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Overtime claim ID'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for cancellation'
        }
      },
      required: ['reason']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime claim cancelled successfully',
    type: OvertimeClaimResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Overtime claim not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel overtime claim in current status'
  })
  async cancelClaim(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req?: any,
  ): Promise<OvertimeClaimResponseDto> {
    return this.overtimeClaimsService.cancelClaim(
      id,
      req.user?.userId || 'system',
      reason
    );
  }

  @Get('statistics/overview')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER
  )
  @ApiOperation({
    summary: 'Get overtime statistics overview',
    description: 'Retrieve overtime claim statistics for reporting and analysis.'
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: String,
    description: 'Filter by department ID'
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Filter by claim date from'
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Filter by claim date to'
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime statistics retrieved successfully'
  })
  async getOvertimeStatistics(
    @Query('departmentId') departmentId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<any> {
    const filters: any = {};
    if (departmentId) filters.departmentId = departmentId;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    return this.overtimeClaimsService.getOvertimeStatistics(filters);
  }

  @Get('employee/:employeeId/statistics')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER,
    UserRole.SUPERVISOR,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get overtime statistics for employee',
    description: 'Retrieve overtime claim statistics for a specific employee.'
  })
  @ApiParam({
    name: 'employeeId',
    type: String,
    description: 'Employee ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime statistics retrieved successfully'
  })
  async getEmployeeOvertimeStatistics(
    @Param('employeeId') employeeId: string,
    @Request() req?: any,
  ): Promise<any> {
    // Check if employee can access these statistics
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && employeeId !== userId) {
      throw new NotFoundException('Employee not found');
    }

    return this.overtimeClaimsService.getEmployeeOvertimeStatistics(employeeId);
  }

  @Get('monthly-summary/:year/:month')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.PAYROLL_ADMIN
  )
  @ApiOperation({
    summary: 'Get monthly overtime summary for payroll',
    description: 'Retrieve monthly summary of overtime claims for payroll processing.'
  })
  @ApiParam({
    name: 'year',
    type: Number,
    description: 'Year (e.g., 2025)'
  })
  @ApiParam({
    name: 'month',
    type: Number,
    description: 'Month (1-12)'
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: String,
    description: 'Filter by department ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly summary retrieved successfully'
  })
  async getMonthlySummary(
    @Param('year') year: number,
    @Param('month') month: number,
    @Query('departmentId') departmentId?: string,
  ): Promise<any> {
    return this.overtimeClaimsService.getMonthlySummary(year, month, departmentId);
  }
}