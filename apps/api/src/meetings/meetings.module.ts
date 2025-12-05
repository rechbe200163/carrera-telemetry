import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingsRepo } from './meetings.repo';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsRepo, PrismaService],
})
export class MeetingsModule {}
