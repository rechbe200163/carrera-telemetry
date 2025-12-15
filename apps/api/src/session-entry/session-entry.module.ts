import { Module } from '@nestjs/common';
import { SessionEntriesRepo } from './session-entry.repo';
import { PrismaService } from 'src/prisma.service';
import { SessionEntriesController } from './session-entry.controller';
import { SessionEntriesService } from './session-entry.service';

@Module({
  controllers: [SessionEntriesController],
  providers: [SessionEntriesService, SessionEntriesRepo, PrismaService],
  exports: [SessionEntriesRepo],
})
export class SessionEntryModule {}
