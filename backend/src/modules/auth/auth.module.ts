import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { OrganizationSeederService } from './services/organization-seeder.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema';
import {
  Department,
  DepartmentSchema,
} from '../organization/departments/schemas/department.schema';
import {
  Position,
  PositionSchema,
} from '../organization/positions/schemas/position.schema';
import {
  Grade,
  GradeSchema,
} from '../organization/grades/schemas/grade.schema';
import { EmployeesModule } from '../employees/employees.module';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      { name: Grade.name, schema: GradeSchema },
    ]),
    forwardRef(() => EmployeesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<number>('JWT_EXPIRES_IN');
        return {
          secret: secret,
          signOptions: {
            expiresIn: expiresIn ? `${expiresIn}s` : '8h', // Format as string with 's'
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    OrganizationSeederService,
    RolesService,
  ],
  controllers: [AuthController, PermissionsController, RolesController],
  exports: [AuthService, JwtStrategy, JwtModule, PassportModule, RolesService],
})
export class AuthModule {}
