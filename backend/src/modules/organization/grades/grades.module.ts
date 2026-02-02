import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GradesService } from './services/grades.service';
import { GradeConfigService } from './services/grade-config.service';
import { SeedGradeConfigMigration } from '../../../scripts/migrations/seed-grade-config.migration'; 
import { Grade, GradeSchema } from './schemas/grade.schema';
import { GradeApprovalConfig, GradeApprovalConfigSchema } from './schemas/grade-approval-config.schema';
import { GradesController } from './grades.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Grade.name, schema: GradeSchema },
      { name: GradeApprovalConfig.name, schema: GradeApprovalConfigSchema },
    ]),
  ],
  controllers: [GradesController], 
  providers: [
    GradesService, 
    GradeConfigService,
    SeedGradeConfigMigration, 
  ],
  exports: [
    GradesService, 
    GradeConfigService, 
    SeedGradeConfigMigration, 
    MongooseModule
  ],
})
export class GradesModule {}