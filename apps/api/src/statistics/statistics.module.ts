import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { PrismaService } from 'src/prisma.service';
import { StatisticsRepo } from './statistics.repo';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, PrismaService, StatisticsRepo],
})
export class StatisticsModule {}
