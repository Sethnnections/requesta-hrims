import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentsModule } from './modules/organization/departments/departments.module';
import { PositionsModule } from './modules/organization/positions/positions.module';
import { GradesModule } from './modules/organization/grades/grades.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { HierarchyModule } from './modules/hierarchy/hierarchy.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { PeriodsModule } from './modules/payroll/periods/periods.module';
import { CalculationsModule } from './modules/payroll/calculations/calculations.module';
import { PayslipsModule } from './modules/payroll/payslips/payslips.module';
import { LoansModule } from './modules/loans/loans.module';
import { TravelRequestsModule } from './modules/travel/requests/requests.module';
import { OvertimeModule } from './modules/overtime/overtime.module';
import { BatchesModule } from './modules/payments/batches/batches.module';
import { ItemsModule } from './modules/payments/items/items.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(), // Global event emitter
    DepartmentsModule,
    PositionsModule,
    GradesModule,
    EmployeesModule,
    HierarchyModule,
    WorkflowsModule,
    PeriodsModule,
    CalculationsModule,
    PayslipsModule,
    LoansModule,
    TravelRequestsModule,
    OvertimeModule,
    BatchesModule,
    ItemsModule,
    DocumentsModule,
    NotificationsModule,
    ReportsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
