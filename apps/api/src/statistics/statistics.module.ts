import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { PrismaService } from 'src/prisma.service';
import { StatisticsRepo } from './statistics.repo';
import { LapsModule } from 'src/laps/laps.module';
import { SessionEntryModule } from 'src/session-entry/session-entry.module';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, PrismaService, StatisticsRepo],
  imports: [LapsModule, SessionEntryModule],
})
export class StatisticsModule {}
