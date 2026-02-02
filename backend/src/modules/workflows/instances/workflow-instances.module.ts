import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstancesController } from './workflow-instances.controller';
import { DynamicWorkflow, DynamicWorkflowSchema } from '../schemas/dynamic-workflow.schema';
import { WorkflowsModule } from '../workflows.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DynamicWorkflow.name, schema: DynamicWorkflowSchema },
    ]),
    WorkflowsModule, 
  ],
  providers: [WorkflowInstancesService],
  controllers: [WorkflowInstancesController],
  exports: [WorkflowInstancesService],
})
export class WorkflowInstancesModule {}