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
import { TravelRequestsService } from './travel-requests.service';
import { CreateTravelRequestDto } from './dto/create-travel-request.dto';
import { TravelRequestResponseDto } from './dto/travel-request-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';
import { TravelStatus } from '../../../common/enums';

@ApiTags('Travel Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('travel/requests')
export class TravelRequestsController {
  constructor(
    private readonly travelRequestsService: TravelRequestsService,
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
    summary: 'Create a new travel request',
    description: 'Submit a new travel request which will automatically initiate the approval workflow.'
  })
  @ApiBody({ type: CreateTravelRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Travel request created successfully',
    type: TravelRequestResponseDto,
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
    @Body() createDto: CreateTravelRequestDto,
    @Request() req: any,
  ): Promise<TravelRequestResponseDto> {
    return this.travelRequestsService.create(createDto, req.user?.userId || 'system');
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
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get all travel requests',
    description: 'Retrieve travel requests with optional filtering. Employees can only see their own requests.'
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
    description: 'Filter by travel status'
  })
  @ApiQuery({
    name: 'travelType',
    required: false,
    type: String,
    description: 'Filter by travel type (LOCAL/INTERNATIONAL)'
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: String,
    description: 'Filter by department ID'
  })
  @ApiQuery({
    name: 'destinationCountry',
    required: false,
    type: String,
    description: 'Filter by destination country'
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Filter by departure date from'
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Filter by return date to'
  })
  @ApiResponse({
    status: 200,
    description: 'Travel requests retrieved successfully',
    type: [TravelRequestResponseDto],
  })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('travelType') travelType?: string,
    @Query('departmentId') departmentId?: string,
    @Query('destinationCountry') destinationCountry?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Request() req?: any,
  ): Promise<TravelRequestResponseDto[]> {
    // If user is employee, only show their own requests
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
    if (travelType) filters.travelType = travelType;
    if (destinationCountry) filters.destinationCountry = destinationCountry;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    return this.travelRequestsService.findAll(filters);
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
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get travel request by ID',
    description: 'Retrieve detailed information about a specific travel request.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Travel request ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Travel request retrieved successfully',
    type: TravelRequestResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Travel request not found'
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<TravelRequestResponseDto> {
    const request = await this.travelRequestsService.findOne(id);

    // Check if employee can access this request
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && request.employeeId !== userId) {
      throw new NotFoundException('Travel request not found');
    }

    return request;
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
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get travel request by reference',
    description: 'Retrieve detailed information about a specific travel request using travel reference.'
  })
  @ApiParam({
    name: 'reference',
    type: String,
    description: 'Travel reference (e.g., TRV-2025-0001)'
  })
  @ApiResponse({
    status: 200,
    description: 'Travel request retrieved successfully',
    type: TravelRequestResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Travel request not found'
  })
  async findByReference(
    @Param('reference') reference: string,
    @Request() req: any,
  ): Promise<TravelRequestResponseDto> {
    const request = await this.travelRequestsService.findByReference(reference);

    // Check if employee can access this request
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && request.employeeId !== userId) {
      throw new NotFoundException('Travel request not found');
    }

    return request;
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
    summary: 'Cancel travel request',
    description: 'Cancel a travel request that is in draft or pending approval status.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Travel request ID'
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
    description: 'Travel request cancelled successfully',
    type: TravelRequestResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Travel request not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel travel request in current status'
  })
  async cancelRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req?: any,
  ): Promise<TravelRequestResponseDto> {
    return this.travelRequestsService.cancelRequest(
      id,
      req.user?.userId || 'system',
      reason
    );
  }

  @Patch(':id/complete')
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
    summary: 'Mark travel request as completed',
    description: 'Mark an approved travel request as completed after travel.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Travel request ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Travel request marked as completed',
    type: TravelRequestResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Travel request not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot complete travel request in current status'
  })
  async completeRequest(
    @Param('id') id: string,
    @Request() req?: any,
  ): Promise<TravelRequestResponseDto> {
    return this.travelRequestsService.completeRequest(
      id,
      req.user?.userId || 'system'
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
    summary: 'Get travel statistics overview',
    description: 'Retrieve travel request statistics for reporting.'
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
    description: 'Filter by departure date from'
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Filter by return date to'
  })
  @ApiResponse({
    status: 200,
    description: 'Travel statistics retrieved successfully'
  })
  async getTravelStatistics(
    @Query('departmentId') departmentId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<any> {
    const filters: any = {};
    if (departmentId) filters.departmentId = departmentId;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    return this.travelRequestsService.getTravelStatistics(filters);
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
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get travel statistics for employee',
    description: 'Retrieve travel request statistics for a specific employee.'
  })
  @ApiParam({
    name: 'employeeId',
    type: String,
    description: 'Employee ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Travel statistics retrieved successfully'
  })
  async getEmployeeTravelStatistics(
    @Param('employeeId') employeeId: string,
    @Request() req?: any,
  ): Promise<any> {
    // Check if employee can access these statistics
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === UserRole.EMPLOYEE && employeeId !== userId) {
      throw new NotFoundException('Employee not found');
    }

    return this.travelRequestsService.getEmployeeTravelStatistics(employeeId);
  }
}