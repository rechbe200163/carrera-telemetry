import { Module } from '@nestjs/common';
import { SessionEntryService } from './session-entry.service';
import { SessionEntryController } from './session-entry.controller';

@Module({
  controllers: [SessionEntryController],
  providers: [SessionEntryService],
})
export class SessionEntryModule {}
