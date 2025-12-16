import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingsRepo } from './meetings.repo';
import { PrismaService } from 'src/prisma.service';
import { SessionsRepo } from 'src/sessions/sessions.repo';
import { SessionsModule } from 'src/sessions/sessions.module';
import { MeetingStatusListener } from './meeting-status.listener';

@Module({
  imports: [SessionsModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsRepo, PrismaService, MeetingStatusListener],
  exports: [MeetingsRepo],
})
export class MeetingsModule {}
