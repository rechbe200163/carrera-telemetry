import { Module } from '@nestjs/common';
import { SessionResultsService } from './session-result.service';
import { SessionResultController } from './session-result.controller';
import { SessionResultsRepo } from './session-result.repo';
import { PrismaService } from 'src/prisma.service';
import { LapsModule } from 'src/laps/laps.module';

@Module({
  imports: [LapsModule],
  controllers: [SessionResultController],
  providers: [SessionResultsService, SessionResultsRepo, PrismaService],
})
export class SessionResultModule {}
