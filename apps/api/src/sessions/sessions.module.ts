import { forwardRef, Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsRepo } from './sessions.repo';
import { PrismaService } from 'src/prisma.service';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SessionRuntimeService } from './session-runtime.service';
import { SessionResultModule } from 'src/session-result/session-result.module';

@Module({
  imports: [MqttModule, forwardRef(() => SessionResultModule)],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionsRepo,
    SessionRuntimeService,
    PrismaService,
  ],
  exports: [SessionsRepo],
})
export class SessionsModule {}
