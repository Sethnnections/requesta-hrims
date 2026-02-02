import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowInstancesService } from './instances/workflow-instances.service';
import { WorkflowInstancesController } from './instances/workflow-instances.controller';
import { DynamicWorkflowEngineService } from './services/dynamic-workflow-engine.service';
import { DelegationService } from './services/delegation.service';
import { WorkflowDefinitionsModule } from './definitions/workflow-definitions.module';
import { EmployeesModule } from '../employees/employees.module';
import { DynamicWorkflow, DynamicWorkflowSchema } from './schemas/dynamic-workflow.schema';
import { WorkflowContext, WorkflowContextSchema } from './schemas/workflow-context.schema';
import { Delegation, DelegationSchema } from './schemas/delegation.schema';
import { WorkflowDefinition, WorkflowDefinitionSchema } from './definitions/schemas/workflow-definition.schema';
import { StageResolutionService } from './services/stage-resolution.service'; 
import { StageResolver, StageResolverSchema } from './schemas/stage-resolver.schema'; 
import { GradesModule } from '../organization/grades/grades.module'; 
import { Department, DepartmentSchema } from '../organization/departments/schemas/department.schema'; 
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema'; 
import { GradeHelperService } from '../organization/grades/services/grade-helper.service'; 


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DynamicWorkflow.name, schema: DynamicWorkflowSchema },
      { name: WorkflowContext.name, schema: WorkflowContextSchema },
      { name: Delegation.name, schema: DelegationSchema },
      { name: WorkflowDefinition.name, schema: WorkflowDefinitionSchema },
      { name: StageResolver.name, schema: StageResolverSchema }, 
      { name: Department.name, schema: DepartmentSchema }, 
      { name: Employee.name, schema: EmployeeSchema },

    ]),
    WorkflowDefinitionsModule,
    EmployeesModule,
    GradesModule, 
  ],
  providers: [
    WorkflowInstancesService, 
    DynamicWorkflowEngineService, 
    DelegationService,
    StageResolutionService,
    GradeHelperService
  ],
  controllers: [WorkflowInstancesController],
  exports: [
    WorkflowInstancesService, 
    DynamicWorkflowEngineService, 
    DelegationService,
    StageResolutionService, 
    GradeHelperService,
    MongooseModule
  ],
})
export class WorkflowsModule {}