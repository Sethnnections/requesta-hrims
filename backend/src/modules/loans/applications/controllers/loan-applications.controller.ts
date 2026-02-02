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
  Put,
  Patch,
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
import { LoanApplicationsService } from '../services/loan-applications.service';
import { CreateLoanApplicationDto } from '../dto/create-loan-application.dto';
import { LoanApplicationResponseDto } from '../dto/loan-application-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/schemas/user.schema';
import { WorkflowStatus } from '../../../../common/enums';

@ApiTags('Loan Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loan-applications')
export class LoanApplicationsController {
  constructor(
    private readonly loanApplicationsService: LoanApplicationsService,
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
    summary: 'Create a new loan application',
    description: 'Submit a new loan application which will automatically initiate the approval workflow.'
  })
  @ApiBody({ type: CreateLoanApplicationDto })
  @ApiResponse({
    status: 201,
    description: 'Loan application created successfully',
    type: LoanApplicationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or validation error'
  })
  @ApiResponse({
    status: 404,
    description: 'Employee or loan type not found'
  })
  async create(
    @Body() createDto: CreateLoanApplicationDto,
    @Request() req: any,
  ): Promise<LoanApplicationResponseDto> {
    return this.loanApplicationsService.create(createDto, req.user?.userId || 'system');
  }

  @Get()
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.MANAGER,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get all loan applications',
    description: 'Retrieve loan applications with optional filtering. Employees can only see their own applications.'
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
    description: 'Filter by application status'
  })
  @ApiQuery({
    name: 'loanType',
    required: false,
    type: String,
    description: 'Filter by loan type'
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: String,
    description: 'Filter by department ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Loan applications retrieved successfully',
    type: [LoanApplicationResponseDto],
  })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('loanType') loanType?: string,
    @Query('departmentId') departmentId?: string,
    @Request() req?: any,
  ): Promise<LoanApplicationResponseDto[]> {
    // If user is employee, only show their own applications
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
    if (loanType) filters.loanType = loanType;

    return this.loanApplicationsService.findAll(filters);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.MANAGER,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get loan application by ID',
    description: 'Retrieve detailed information about a specific loan application.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Loan application ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Loan application retrieved successfully',
    type: LoanApplicationResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Loan application not found'
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<LoanApplicationResponseDto> {
    const application = await this.loanApplicationsService.findOne(id);

    // Check if employee can access this application
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && application.employee?.id !== userId) {
      throw new NotFoundException('Loan application not found');
    }

    return application;
  }

  @Patch(':id/disburse')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER
  )
  @ApiOperation({
    summary: 'Disburse approved loan',
    description: 'Mark an approved loan as disbursed and create repayment schedule.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Loan application ID'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        disbursementDate: {
          type: 'string',
          format: 'date-time',
          description: 'Disbursement date (optional, defaults to current date)'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Loan disbursed successfully',
    type: LoanApplicationResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Loan application not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Loan is not approved or already disbursed'
  })
  async disburseLoan(
    @Param('id') id: string,
    @Body('disbursementDate') disbursementDate?: Date,
    @Request() req?: any,
  ): Promise<LoanApplicationResponseDto> {
    return this.loanApplicationsService.disburseLoan(
      id,
      req.user?.userId || 'system',
      disbursementDate
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
    summary: 'Cancel loan application',
    description: 'Cancel a loan application that is in draft or pending approval status.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Loan application ID'
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
    description: 'Loan application cancelled successfully',
    type: LoanApplicationResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Loan application not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel loan application in current status'
  })
  async cancelApplication(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req?: any,
  ): Promise<LoanApplicationResponseDto> {
    return this.loanApplicationsService.cancelApplication(
      id,
      req.user?.userId || 'system',
      reason
    );
  }

  @Get('employee/:employeeId/statistics')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.MANAGER,
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get loan statistics for employee',
    description: 'Retrieve loan application statistics for a specific employee.'
  })
  @ApiParam({
    name: 'employeeId',
    type: String,
    description: 'Employee ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Loan statistics retrieved successfully'
  })
  async getEmployeeLoanStatistics(
    @Param('employeeId') employeeId: string,
    @Request() req?: any,
  ): Promise<any> {
    // Check if employee can access these statistics
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && employeeId !== userId) {
      throw new NotFoundException('Employee not found');
    }

    return this.loanApplicationsService.getEmployeeLoanStatistics(employeeId);
  }
}