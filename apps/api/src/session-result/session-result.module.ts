import { Module } from '@nestjs/common';
import { SessionResultService } from './session-result.service';
import { SessionResultController } from './session-result.controller';

@Module({
  controllers: [SessionResultController],
  providers: [SessionResultService],
})
export class SessionResultModule {}
