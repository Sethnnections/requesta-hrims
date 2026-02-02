/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Employee,
  EmployeeDocument,
} from '../modules/employees/schemas/employee.schema';
import {
  Position,
  PositionDocument,
} from '../modules/organization/positions/schemas/position.schema';
import {
  Grade,
  GradeDocument,
} from '../modules/organization/grades/schemas/grade.schema';

@Injectable()
export class FixSupervisorFlagsMigration {
  private readonly logger = new Logger(FixSupervisorFlagsMigration.name);

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Starting supervisor flags migration...');

    const employees = await this.employeeModel.find().exec();
    let updatedCount = 0;

    for (const employee of employees) {
      const updates: any = {};
      let needsUpdate = false;

      // Get position and grade
      const position = await this.positionModel.findById(employee.positionId);
      const grade = await this.gradeModel.findById(employee.gradeId);

      // Determine supervisor status based on position title
      if (position?.positionTitle) {
        const title = position.positionTitle.toLowerCase();
        const shouldBeSupervisor =
          title.includes('supervisor') ||
          title.includes('team lead') ||
          title.includes('senior') ||
          title.includes('manager') ||
          title.includes('head') ||
          title.includes('director') ||
          title.includes('chief');

        const shouldBeDeptManager =
          title.includes('manager') ||
          title.includes('head') ||
          title.includes('director') ||
          title.includes('chief');

        if (shouldBeSupervisor !== employee.isSupervisor) {
          updates.isSupervisor = shouldBeSupervisor;
          needsUpdate = true;
        }

        if (shouldBeDeptManager !== employee.isDepartmentManager) {
          updates.isDepartmentManager = shouldBeDeptManager;
          needsUpdate = true;
        }
      }

      // Determine based on grade level
      if (grade) {
        const gradeBasedSupervisor = grade.level >= 6; // M8 and above
        const gradeBasedManager = grade.level >= 10; // M13 and above

        if (gradeBasedSupervisor && !updates.isSupervisor) {
          updates.isSupervisor = true;
          needsUpdate = true;
        }

        if (gradeBasedManager && !updates.isDepartmentManager) {
          updates.isDepartmentManager = true;
          needsUpdate = true;
        }
      }

      // Update employee if needed
      if (needsUpdate) {
        await this.employeeModel.findByIdAndUpdate(employee._id, updates);
        updatedCount++;
        this.logger.log(
          `Updated ${employee.employeeNumber}: ${employee.firstName} ${employee.lastName}`,
        );
        this.logger.log(
          `  Supervisor: ${updates.isSupervisor ?? employee.isSupervisor}`,
        );
        this.logger.log(
          `  Dept Manager: ${updates.isDepartmentManager ?? employee.isDepartmentManager}`,
        );
      }
    }

    this.logger.log(`Migration completed. Updated ${updatedCount} employees.`);
  }
}
