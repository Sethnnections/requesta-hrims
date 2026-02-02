import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelRequestsService } from './travel-requests.service';
import { TravelRateConfigService } from './travel-rate-config.service';
import { TravelRequestsController } from './travel-requests.controller';
import { TravelRateConfigController } from './travel-rate-config.controller';
import { TravelWorkflowHandler } from './handlers/travel-workflow.handler';
import { TravelRequest, TravelRequestSchema } from './schemas/travel-request.schema';
import { TravelRateConfig, TravelRateConfigSchema } from './schemas/travel-rate-config.schema';
import { Employee, EmployeeSchema } from '../../employees/schemas/employee.schema';
import { WorkflowsModule } from '../../workflows/workflows.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TravelRequest.name, schema: TravelRequestSchema },
      { name: TravelRateConfig.name, schema: TravelRateConfigSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    WorkflowsModule,
  ],
  controllers: [TravelRequestsController, TravelRateConfigController],
  providers: [
    TravelRequestsService,
    TravelRateConfigService,
    TravelWorkflowHandler,
  ],
  exports: [TravelRequestsService, TravelRateConfigService],
})
export class TravelRequestsModule {}