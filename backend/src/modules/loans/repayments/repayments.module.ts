import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LoanRepayment,
  LoanRepaymentSchema,
} from './schemas/loan-repayment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanRepayment.name, schema: LoanRepaymentSchema },
    ]),
  ],
  providers: [],
  exports: [],
})
export class RepaymentsModule {}
