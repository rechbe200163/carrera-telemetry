import { forwardRef, Module } from '@nestjs/common';
import { SessionResultsService } from './session-result.service';
import { SessionResultController } from './session-result.controller';
import { SessionResultsRepo } from './session-result.repo';
import { PrismaService } from 'src/prisma.service';
import { LapsModule } from 'src/laps/laps.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [LapsModule, forwardRef(() => SessionsModule)],
  controllers: [SessionResultController],
  providers: [SessionResultsService, SessionResultsRepo, PrismaService],
  exports: [SessionResultsService],
})
export class SessionResultModule {}
