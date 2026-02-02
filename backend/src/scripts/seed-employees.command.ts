import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { OrganizationSeederService } from '../modules/auth/services/organization-seeder.service';

@Injectable()
@Command({
  name: 'seed-employees',
  description:
    'Seed  employee hierarchy with complete organizational structure',
})
export class SeedEmployemand extends CommandRunner {
  constructor(private readonly organizationSeeder: OrganizationSeederService) {
    super();
  }

  async run(): Promise<void> {
    console.log(' Starting  employee hierarchy seeding...');

    try {
      await this.organizationSeeder.createCompleteEmployeeHierarchy();
      console.log(' Employee hierarchy seeding completed successfully!');
    } catch (error) {
      console.error(' Error seeding employee hierarchy:', error);
      throw error;
    }
  }
}
