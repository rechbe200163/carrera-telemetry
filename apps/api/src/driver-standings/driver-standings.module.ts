import { Module } from '@nestjs/common';
import { DriverStandingsService } from './driver-standings.service';
import { DriverStandingsController } from './driver-standings.controller';

@Module({
  controllers: [DriverStandingsController],
  providers: [DriverStandingsService],
})
export class DriverStandingsModule {}
