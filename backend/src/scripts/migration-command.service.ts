import { Injectable, Logger } from '@nestjs/common';
import { SeedGradeConfigMigration } from './migrations/seed-grade-config.migration';

@Injectable()
export class MigrationCommandService {
  private readonly logger = new Logger(MigrationCommandService.name);

  constructor(
    private readonly seedGradeConfigMigration: SeedGradeConfigMigration,
  ) {}

  async runGradeConfigMigration(): Promise<void> {
    try {
      await this.seedGradeConfigMigration.run();
      this.logger.log('✅ Grade configuration migration completed successfully');
    } catch (error) {
      this.logger.error('❌ Grade configuration migration failed:', error);
      throw error;
    }
  }
}