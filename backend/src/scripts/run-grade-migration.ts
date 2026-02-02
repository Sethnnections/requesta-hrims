import { NestFactory } from '@nestjs/core';
import { GradesModule } from '../modules/organization/grades/grades.module';
import { SeedGradeConfigMigration } from './migrations/seed-grade-config.migration';

async function bootstrap() {

  const app = await NestFactory.createApplicationContext(GradesModule);
  
  try {

    const migration = app.get(SeedGradeConfigMigration);
    await migration.run();
    console.log(' Grade configuration migration completed successfully');

  } catch (error) {

    console.error(' Migration failed:', error);
    process.exit(1);

  } finally {

    await app.close();
    
  }
}

bootstrap();