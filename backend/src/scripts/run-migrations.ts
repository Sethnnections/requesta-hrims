import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedGradeConfigMigration } from './migrations/seed-grade-config.migration';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const migration = app.get(SeedGradeConfigMigration);
    await migration.run();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();