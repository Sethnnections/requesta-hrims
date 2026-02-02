import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OvertimeClaimsService } from './overtime-claims.service';
import { OvertimeRateConfigService } from './overtime-rate-config.service';
import { OvertimeClaimsController } from './overtime-claims.controller';
import { OvertimeRateConfigController } from './overtime-rate-config.controller';
import { OvertimeWorkflowHandler } from './handlers/overtime-workflow.handler';
import { OvertimeClaim, OvertimeClaimSchema } from './schemas/overtime-claim.schema';
import { OvertimeRateConfig, OvertimeRateConfigSchema } from './schemas/overtime-rate-config.schema';
import { Employee, EmployeeSchema } from '../../employees/schemas/employee.schema';
import { WorkflowsModule } from '../../workflows/workflows.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OvertimeClaim.name, schema: OvertimeClaimSchema },
      { name: OvertimeRateConfig.name, schema: OvertimeRateConfigSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    WorkflowsModule,
  ],
  controllers: [OvertimeClaimsController, OvertimeRateConfigController],
  providers: [
    OvertimeClaimsService,
    OvertimeRateConfigService,
    OvertimeWorkflowHandler,
  ],
  exports: [OvertimeClaimsService, OvertimeRateConfigService],
})
export class OvertimeClaimsModule {}