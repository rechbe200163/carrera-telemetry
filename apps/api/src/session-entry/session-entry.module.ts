import { Module } from '@nestjs/common';
import { SessionEntryService } from './session-entry.service';
import { SessionEntryController } from './session-entry.controller';
import { SessionEntriesRepo } from './session-entry.repo';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SessionEntryController],
  providers: [SessionEntryService, SessionEntriesRepo, PrismaService],
})
export class SessionEntryModule {}
