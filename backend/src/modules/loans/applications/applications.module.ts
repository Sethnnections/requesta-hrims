import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoanApplicationsController } from './controllers/loan-applications.controller';
import { LoanApplicationsService } from './services/loan-applications.service';
import { LoanApplication, LoanApplicationSchema } from './schemas/loan-application.schema';
import { WorkflowInstancesService } from '../../workflows/instances/workflow-instances.service';
import { DynamicWorkflowEngineService } from '../../workflows/services/dynamic-workflow-engine.service';
import { WorkflowsModule } from '../../workflows/workflows.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoanType, LoanTypeSchema } from '../types/schemas/loan-type.schema';
import { Employee, EmployeeSchema } from '../../employees/schemas/employee.schema';
import { TypesModule } from '../types/types.module';
import { LoanWorkflowHandler } from './handlers/loan-workflow.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanApplication.name, schema: LoanApplicationSchema },
      { name: LoanType.name, schema: LoanTypeSchema },
      { name: Employee.name, schema: EmployeeSchema }
    ]),
    EventEmitterModule.forRoot(),
    WorkflowsModule,
    TypesModule,
  ],
  controllers: [LoanApplicationsController],
  providers: [
    LoanApplicationsService,
    LoanWorkflowHandler, // Register the event handler
  ],
  exports: [LoanApplicationsService],
})
export class ApplicationsModule {}