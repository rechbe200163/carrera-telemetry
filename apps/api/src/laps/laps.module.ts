import { Module } from '@nestjs/common';
import { LapsService } from './laps.service';
import { LapsController } from './laps.controller';
import { LapsRepo } from './laps.repo';
import { PrismaService } from 'src/prisma.service';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SessionEntryModule } from 'src/session-entry/session-entry.module';

@Module({
  imports: [MqttModule, SessionEntryModule],
  controllers: [LapsController],
  providers: [LapsService, LapsRepo, PrismaService],
  exports: [LapsRepo],
})
export class LapsModule {}
