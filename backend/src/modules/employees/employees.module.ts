import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeeNumberService } from './employee-number.service';
import { EmployeeNumberController } from './employee-number.controller';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { PositionsModule } from '../organization/positions/positions.module';
import { GradesModule } from '../organization/grades/grades.module';
import { DepartmentsModule } from '../organization/departments/departments.module';
import { EmailService } from '../../common/services/email.service';
import { EmailTemplatesService } from '../../common/services/email-templates.service';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    PositionsModule,
    GradesModule,
    DepartmentsModule,
    forwardRef(() => AuthModule), 
  ],
  providers: [
    EmployeesService,
    EmployeeNumberService,
    EmailService,
    EmailTemplatesService,
  ],
  controllers: [EmployeesController, EmployeeNumberController],
  exports: [EmployeesService, EmployeeNumberService, MongooseModule],
})
export class EmployeesModule {}