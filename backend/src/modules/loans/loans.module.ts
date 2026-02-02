import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsModule } from './applications/applications.module';
import { TypesModule } from './types/types.module';
import { RepaymentsModule } from './repayments/repayments.module';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema }
    ]),
    ApplicationsModule,
    TypesModule,
    RepaymentsModule,
  ],
  exports: [ApplicationsModule, TypesModule, RepaymentsModule],
})
export class LoansModule {}
