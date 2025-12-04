import { Module } from '@nestjs/common';
import { LapTimesService } from './lap-times.service';
import { LapTimesController } from './lap-times.controller';
import { LapTimesRepository } from './lap-times.repository';

@Module({
  controllers: [LapTimesController],
  providers: [LapTimesService, LapTimesRepository],
})
export class LapTimesModule {}
