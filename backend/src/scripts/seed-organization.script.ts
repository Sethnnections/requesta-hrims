import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { OrganizationSeederService } from '../modules/auth/services/organization-seeder.service';

async function bootstrap() {
  console.log(' Starting ESCOM employee hierarchy seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seeder = app.get(OrganizationSeederService);

    await seeder.createCompleteEmployeeHierarchy();
    console.log(' Employee hierarchy seeding completed successfully!');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding employee hierarchy:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
