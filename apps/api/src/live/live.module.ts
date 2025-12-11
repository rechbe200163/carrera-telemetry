import { Module } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveSessionsController } from './live.controller';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  controllers: [LiveSessionsController],
  providers: [LiveService],
})
export class LiveModule {}
