import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OvertimeRateConfigService } from './overtime-rate-config.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';
import { OvertimeType } from '../../../common/enums';

@ApiTags('Overtime Rate Configurations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('overtime/claims/rates')
export class OvertimeRateConfigController {
  constructor(
    private readonly overtimeRateConfigService: OvertimeRateConfigService,
  ) {}

  @Get('active')
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
    summary: 'Get active overtime rates',
    description: 'Retrieve active overtime rate configurations by grade and type.'
  })
  @ApiQuery({
    name: 'overtimeType',
    required: false,
    enum: OvertimeType,
    description: 'Filter by overtime type'
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime rates retrieved successfully'
  })
  async getActiveRates(
    @Query('overtimeType') overtimeType?: OvertimeType,
  ): Promise<any> {
    const rates = await this.overtimeRateConfigService.getAllActiveRates(overtimeType);
    
    return {
      rates: rates.map(rate => ({
        gradeCode: rate.gradeCode,
        overtimeType: rate.overtimeType,
        baseMultiplier: rate.baseMultiplier,
        minimumHours: rate.minimumHours,
        maximumHoursPerDay: rate.maximumHoursPerDay,
        maximumHoursPerMonth: rate.maximumHoursPerMonth,
        approvalRules: rate.approvalRules,
        effectiveFrom: rate.effectiveFrom,
        effectiveTo: rate.effectiveTo,
      }))
    };
  }

  @Get('calculate')
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
    summary: 'Calculate overtime payment',
    description: 'Calculate overtime payment based on grade, type, hours, and basic rate.'
  })
  @ApiQuery({
    name: 'gradeCode',
    required: true,
    type: String,
    description: 'Employee grade code'
  })
  @ApiQuery({
    name: 'overtimeType',
    required: true,
    enum: OvertimeType,
    description: 'Overtime type'
  })
  @ApiQuery({
    name: 'totalHours',
    required: true,
    type: Number,
    description: 'Total overtime hours'
  })
  @ApiQuery({
    name: 'basicHourlyRate',
    required: true,
    type: Number,
    description: 'Basic hourly rate'
  })
  @ApiResponse({
    status: 200,
    description: 'Overtime payment calculated successfully'
  })
  async calculatePayment(
    @Query('gradeCode') gradeCode: string,
    @Query('overtimeType') overtimeType: OvertimeType,
    @Query('totalHours') totalHours: number,
    @Query('basicHourlyRate') basicHourlyRate: number,
  ): Promise<any> {
    const calculation = await this.overtimeRateConfigService.calculateOvertimePay(
      gradeCode,
      overtimeType,
      totalHours,
      basicHourlyRate
    );

    return {
      gradeCode,
      overtimeType,
      totalHours,
      basicHourlyRate,
      calculation,
      summary: {
        effectiveHours: calculation.calculatedHours,
        hourlyRate: calculation.overtimeRate,
        totalPayment: calculation.totalAmount,
        multiplier: calculation.overtimeMultiplier
      }
    };
  }

  @Get('validate')
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
    summary: 'Validate overtime against limits',
    description: 'Validate overtime hours against grade-based limits.'
  })
  @ApiQuery({
    name: 'gradeCode',
    required: true,
    type: String,
    description: 'Employee grade code'
  })
  @ApiQuery({
    name: 'overtimeType',
    required: true,
    enum: OvertimeType,
    description: 'Overtime type'
  })
  @ApiQuery({
    name: 'totalHours',
    required: true,
    type: Number,
    description: 'Total overtime hours'
  })
  @ApiResponse({
    status: 200,
    description: 'Validation results retrieved successfully'
  })
  async validateOvertime(
    @Query('gradeCode') gradeCode: string,
    @Query('overtimeType') overtimeType: OvertimeType,
    @Query('totalHours') totalHours: number,
  ): Promise<any> {
    const validation = await this.overtimeRateConfigService.validateOvertimeLimits(
      gradeCode,
      overtimeType,
      totalHours,
      new Date()
    );

    return {
      gradeCode,
      overtimeType,
      totalHours,
      validation,
      isWithinLimits: validation.isValid
    };
  }
}