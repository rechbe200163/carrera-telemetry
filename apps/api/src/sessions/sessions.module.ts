import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsRepo } from './sessions.repo';
import { PrismaService } from 'src/prisma.service';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SessionRuntimeService } from './session-runtime.service';
import { SessionsEventsService } from './sessions-events.service';
import { SessionLifecycleService } from './session-lifecycle.service';
import { SessionRuntimeListener } from './session-runtime.listener';

@Module({
  imports: [
    MqttModule,
  ],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionsRepo,
    SessionRuntimeService,
    SessionLifecycleService,
    SessionRuntimeListener,
    PrismaService,
    SessionsEventsService,
  ],
  exports: [SessionsRepo, SessionRuntimeService, SessionLifecycleService],
})
export class SessionsModule {}
