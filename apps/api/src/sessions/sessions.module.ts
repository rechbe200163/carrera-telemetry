import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsRepo } from './sessions.repo';
import { PrismaService } from 'src/prisma.service';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsRepo, PrismaService],
  exports: [SessionsRepo],
})
export class SessionsModule {}
