import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowDefinitionsService } from './services/workflow-definitions.service';
import { WorkflowDefinitionSetupService } from './services/workflow-definition-setup.service';
import { WorkflowDefinitionsController } from './controllers/workflow-definitions.controller';
import { WorkflowDefinition, WorkflowDefinitionSchema } from './schemas/workflow-definition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkflowDefinition.name, schema: WorkflowDefinitionSchema },
    ]),
  ],
  providers: [WorkflowDefinitionsService, WorkflowDefinitionSetupService],
  controllers: [WorkflowDefinitionsController],
  exports: [WorkflowDefinitionsService, WorkflowDefinitionSetupService, MongooseModule],
})
export class WorkflowDefinitionsModule {}