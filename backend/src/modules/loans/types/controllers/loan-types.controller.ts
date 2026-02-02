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
import { LoanTypesService } from '../services/loan-types.service';
import { CreateLoanTypeDto } from '../dto/create-loan-type.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/schemas/user.schema';

@ApiTags('Loan Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loan-types')
export class LoanTypesController {
  constructor(
    private readonly loanTypesService: LoanTypesService,
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
    summary: 'Create a new loan type',
    description: 'Create a new loan type with eligibility criteria and terms.'
  })
  @ApiBody({ type: CreateLoanTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Loan type created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 409,
    description: 'Loan type code already exists'
  })
  async create(
    @Body() createDto: CreateLoanTypeDto,
    @Request() req: any,
  ) {
    return this.loanTypesService.create(createDto, req.user?.userId || 'system');
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
    summary: 'Get all loan types',
    description: 'Retrieve all loan types with optional filtering for active types only.'
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter to show only active loan types'
  })
  @ApiResponse({
    status: 200,
    description: 'Loan types retrieved successfully',
  })
  async findAll(
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    return this.loanTypesService.findAll(activeOnly);
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
    summary: 'Get loan type by ID',
    description: 'Retrieve detailed information about a specific loan type.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Loan type ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Loan type retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan type not found'
  })
  async findOne(@Param('id') id: string) {
    return this.loanTypesService.findOne(id);
  }

  @Get('code/:code')
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
    summary: 'Get loan type by code',
    description: 'Retrieve loan type information using its unique code.'
  })
  @ApiParam({
    name: 'code',
    type: String,
    description: 'Loan type code'
  })
  @ApiResponse({
    status: 200,
    description: 'Loan type retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan type not found'
  })
  async findByCode(@Param('code') code: string) {
    return this.loanTypesService.findByCode(code);
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
    summary: 'Update loan type',
    description: 'Update an existing loan type configuration.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Loan type ID'
  })
  @ApiBody({ type: CreateLoanTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Loan type updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan type not found'
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: CreateLoanTypeDto,
    @Request() req: any,
  ) {
    return this.loanTypesService.update(id, updateDto, req.user?.userId || 'system');
  }

  @Delete(':id')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN
  )
  @ApiOperation({
    summary: 'Delete loan type',
    description: 'Permanently delete a loan type. Use with caution.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Loan type ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Loan type deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan type not found'
  })
  async remove(@Param('id') id: string) {
    return this.loanTypesService.remove(id);
  }

  @Put(':id/toggle-active')
  @Roles(
    UserRole.SUPER_SUPER_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.HR_ADMIN,
    UserRole.HR_MANAGER
  )
  @ApiOperation({
    summary: 'Toggle loan type active status',
    description: 'Activate or deactivate a loan type.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Loan type ID'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          description: 'Whether to activate or deactivate the loan type'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Loan type status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan type not found'
  })
  async toggleActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @Request() req: any,
  ) {
    return this.loanTypesService.toggleActive(id, isActive, req.user?.userId || 'system');
  }
}
