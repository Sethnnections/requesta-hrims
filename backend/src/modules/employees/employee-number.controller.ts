import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
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
import { EmployeeNumberService } from './employee-number.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

@ApiTags('Employee Numbers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employee-numbers')
export class EmployeeNumberController {
  constructor(private readonly employeeNumberService: EmployeeNumberService) {}

  @Get('generate/:departmentId')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate employee number for department' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Employee number generated successfully' })
  async generateEmployeeNumber(@Param('departmentId') departmentId: string): Promise<{ employeeNumber: string }> {
    const employeeNumber = await this.employeeNumberService.generateEmployeeNumber(departmentId);
    return { employeeNumber };
  }

  @Get('stats')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get employee number statistics' })
  @ApiResponse({ status: 200, description: 'Employee number statistics retrieved' })
  async getEmployeeNumberStats(): Promise<any> {
    return this.employeeNumberService.getEmployeeNumberStats();
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate employee number format' })
  @ApiResponse({ status: 200, description: 'Employee number validation result' })
  async validateEmployeeNumber(@Body() body: { employeeNumber: string }): Promise<{ valid: boolean; parsed?: any }> {
    const valid = this.employeeNumberService.validateEmployeeNumber(body.employeeNumber);
    const parsed = valid ? this.employeeNumberService.parseEmployeeNumber(body.employeeNumber) : null;
    
    return { valid, parsed };
  }

  @Post('bulk-generate')
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bulk generate employee numbers for testing' })
  @ApiQuery({ name: 'count', required: false, description: 'Number of employee numbers to generate' })
  @ApiResponse({ status: 200, description: 'Employee numbers generated successfully' })
  async bulkGenerateEmployeeNumbers(@Query('count') count: number = 10): Promise<{ employeeNumbers: string[] }> {
    const employeeNumbers = await this.employeeNumberService.bulkGenerateEmployeeNumbers(count);
    return { employeeNumbers };
  }

  @Post('regenerate')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Regenerate employee numbers (system migration)' })
  @ApiQuery({ name: 'batchSize', required: false, description: 'Number of employees to process per batch' })
  @ApiResponse({ status: 200, description: 'Employee numbers regeneration completed' })
  async regenerateEmployeeNumbers(@Query('batchSize') batchSize: number = 100): Promise<{ processed: number; updated: number }> {
    return this.employeeNumberService.regenerateEmployeeNumbers(batchSize);
  }

  @Get('sample/:departmentCode')
  @ApiOperation({ summary: 'Get sample employee number for department' })
  @ApiParam({ name: 'departmentCode', description: 'Department code' })
  @ApiResponse({ status: 200, description: 'Sample employee number generated' })
  async getSampleEmployeeNumber(@Param('departmentCode') departmentCode: string): Promise<{ sample: string }> {
    // This is a simplified version for demonstration
    const currentYear = new Date().getFullYear();
    const sample = `EMP/${departmentCode}/${currentYear}/001`;
    return { sample };
  }
}