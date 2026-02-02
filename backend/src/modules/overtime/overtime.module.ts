import { Module } from '@nestjs/common';
import { OvertimeClaimsModule } from './claims/claims.module';

@Module({
  imports: [OvertimeClaimsModule],
  exports: [OvertimeClaimsModule],
})
export class OvertimeModule {}