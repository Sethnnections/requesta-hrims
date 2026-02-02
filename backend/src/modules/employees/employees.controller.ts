import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActivateSystemAccessDto } from './dto/activate-system-access.dto';
import { UserRole } from 'src/common/enums';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  positionsService: any;
  gradesService: any;
  employeeModel: any;
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('register')
  async registerEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    const { createSystemAccess, systemUsername, systemRole, ...employeeData } =
      createEmployeeDto;

    const registrationData: CreateEmployeeDto = {
      ...employeeData,
    } as CreateEmployeeDto;

    // Use req.user.userId if available, otherwise use a default for testing
    const hrAdminId = req.user?.userId || 'system-admin-id';

    return this.employeesService.registerEmployee(registrationData, hrAdminId);
  }

  @Patch(':id/activate-system-access')
  //@Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate system access for employee' })
  @ApiResponse({ status: 200, description: 'System access activated successfully' })
  async activateSystemAccess(
    @Param('id') id: string,
    @Body() activateSystemAccessDto: ActivateSystemAccessDto,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.activateSystemAccess(
      id,
      activateSystemAccessDto,
      req.user.userId,
    );
  }

  @Post(':id/verify-profile')
  @ApiOperation({ summary: 'Employee: Verify own profile information' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile verified successfully',
    type: EmployeeResponseDto,
  })
  async verifyEmployeeProfile(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    // Ensure employee can only verify their own profile
    if (req.user.employeeId !== id && req.user.role !== 'hr_admin') {
      throw new ForbiddenException('You can only verify your own profile');
    }
    return this.employeesService.verifyEmployeeProfile(id);
  }

  @Get(':id/registration-status')
  @ApiOperation({
    summary: 'Get employee registration and system access status',
  })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Registration status retrieved',
  })
  async getRegistrationStatus(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{
    employeeId: string;
    employeeNumber: string;
    hasSystemAccess: boolean;
    systemUsername?: string;
    profileVerified: boolean;
    registrationStatus: string;
    registrationComplete: boolean;
    welcomeEmailSent: boolean;
    credentialsEmailSent: boolean;
  }> {
    const employee = await this.employeesService.findOne(
      id,
      req.user?.employeeId,
      req.user?.role,
    );

    // Type assertion to ensure we have the registration status fields
    const employeeWithReg = employee as EmployeeResponseDto & {
      registrationStatus: string;
      welcomeEmailSent: boolean;
      credentialsEmailSent: boolean;
    };

    return {
      employeeId: employee._id.toString(),
      employeeNumber: employee.employeeNumber,
      hasSystemAccess: employee.hasSystemAccess,
      systemUsername: employee.systemUsername,
      profileVerified: employee.profileVerified,
      registrationStatus: employeeWithReg.registrationStatus || 'PENDING',
      registrationComplete: employeeWithReg.registrationStatus === 'COMPLETED',
      welcomeEmailSent: employeeWithReg.welcomeEmailSent || false,
      credentialsEmailSent: employeeWithReg.credentialsEmailSent || false,
    };
  }

  @Post('request-registration')
  @ApiOperation({
    summary: 'Manager: Request employee registration (creates draft)',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee registration requested successfully',
    type: EmployeeResponseDto,
  })
  // @Roles('manager')
  async requestEmployeeRegistration(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.requestEmployeeRegistration(
      createEmployeeDto,
      req.user.userId,
    );
  }

  @Post(':id/approve-registration')
  @ApiOperation({
    summary: 'HR Admin: Approve employee registration and create system access',
  })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee registration approved',
    type: EmployeeResponseDto,
  })
  // @Roles('hr_admin')
  async approveEmployeeRegistration(
    @Param('id') id: string,
    @Body() systemAccessData: { systemUsername: string; systemRole: string },
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.approveEmployeeRegistration(
      id,
      systemAccessData,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
  })
  async findAll(
    @Query() query: QueryEmployeeDto,
    @Request() req: any,
  ): Promise<PaginationResponseDto<EmployeeResponseDto>> {
    return this.employeesService.findAll(query, req.user?.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee retrieved successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.findOne(
      id,
      req.user?.employeeId,
      req.user?.role,
    );
  }

@Post(':id/check-supervisor-status')
@Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
async checkAndUpdateSupervisorStatus(@Param('id') id: string) {
  const employee = await this.employeesService.findOne(id);
  
  // Get position and grade
  const position = await this.positionsService.findOne(employee.positionId.toString());
  const grade = await this.gradesService.findOne(employee.gradeId.toString());
  
  const title = position.positionTitle.toLowerCase();
  const shouldBeSupervisor = title.includes('supervisor') || 
                            title.includes('team lead') || 
                            title.includes('senior') ||
                            title.includes('manager') ||
                            title.includes('head') ||
                            title.includes('director') ||
                            title.includes('chief');
  
  const shouldBeDeptManager = title.includes('manager') || 
                             title.includes('head') || 
                             title.includes('director') ||
                             title.includes('chief');
  
  const gradeBasedSupervisor = grade.level >= 6; // M8 and above
  const gradeBasedManager = grade.level >= 10; // M13 and above
  
  const finalSupervisor = shouldBeSupervisor || gradeBasedSupervisor;
  const finalManager = shouldBeDeptManager || gradeBasedManager;
  
  // Update if needed
  if (finalSupervisor !== employee.isSupervisor || finalManager !== employee.isDepartmentManager) {
    const updated = await this.employeeModel.findByIdAndUpdate(id, {
      isSupervisor: finalSupervisor,
      isDepartmentManager: finalManager
    }, { new: true });
    
    return {
      message: 'Supervisor status updated',
      previous: {
        isSupervisor: employee.isSupervisor,
        isDepartmentManager: employee.isDepartmentManager
      },
      updated: {
        isSupervisor: finalSupervisor,
        isDepartmentManager: finalManager
      },
      reasons: {
        positionBased: {
          supervisor: shouldBeSupervisor,
          manager: shouldBeDeptManager,
          positionTitle: position.positionTitle
        },
        gradeBased: {
          supervisor: gradeBasedSupervisor,
          manager: gradeBasedManager,
          gradeCode: grade.code,
          gradeLevel: grade.level
        }
      }
    };
  }
  
  return {
    message: 'No changes needed',
    current: {
      isSupervisor: employee.isSupervisor,
      isDepartmentManager: employee.isDepartmentManager
    }
  };
}

  // ... Other endpoints for update, delete, etc.
}
