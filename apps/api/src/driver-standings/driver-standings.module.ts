import { Module } from '@nestjs/common';
import { DriverStandingsService } from './driver-standings.service';
import { DriverStandingsController } from './driver-standings.controller';
import { DriverStandingsRepo } from './driver-standings.repo';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [DriverStandingsController],
  providers: [DriverStandingsService, DriverStandingsRepo, PrismaService],
})
export class DriverStandingsModule {}
