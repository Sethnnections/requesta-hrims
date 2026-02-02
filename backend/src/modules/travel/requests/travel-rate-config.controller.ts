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
import { TravelRateConfigService } from './travel-rate-config.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';
import { TravelType } from '../../../common/enums';

@ApiTags('Travel Rate Configurations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('travel/requests/rates')
export class TravelRateConfigController {
  constructor(
    private readonly travelRateConfigService: TravelRateConfigService,
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
    UserRole.EMPLOYEE
  )
  @ApiOperation({
    summary: 'Get active travel rates',
    description: 'Retrieve active travel rate configurations.'
  })
  @ApiQuery({
    name: 'travelType',
    required: false,
    enum: TravelType,
    description: 'Filter by travel type'
  })
  @ApiResponse({
    status: 200,
    description: 'Travel rates retrieved successfully'
  })
  async getActiveRates(
    @Query('travelType') travelType?: TravelType,
  ): Promise<any> {
    const rates = await this.travelRateConfigService.getAllActiveRates(travelType);
    
    return {
      rates: rates.map(rate => ({
        gradeCode: rate.gradeCode,
        travelType: rate.travelType,
        currency: rate.currency,
        perDiemRate: rate.perDiemRate,
        accommodationRate: rate.accommodationRate,
        transportRate: rate.transportRate,
        communicationRate: rate.communicationRate,
        incidentalsRate: rate.incidentalsRate,
        limits: rate.limits,
      }))
    };
  }
}