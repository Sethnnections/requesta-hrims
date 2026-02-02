import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { Position, PositionSchema } from './schemas/position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  providers: [PositionsService],
  controllers: [PositionsController],
  exports: [MongooseModule, PositionsService],
})
export class PositionsModule {}