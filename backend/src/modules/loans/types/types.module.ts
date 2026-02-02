import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoanTypesController } from './controllers/loan-types.controller';
import { LoanTypesService } from './services/loan-types.service';
import { LoanType, LoanTypeSchema } from './schemas/loan-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanType.name, schema: LoanTypeSchema }
    ]),
  ],
  controllers: [LoanTypesController],
  providers: [LoanTypesService],
  exports: [LoanTypesService],
})
export class TypesModule {}
