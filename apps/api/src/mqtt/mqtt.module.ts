import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { SessionMqttListener } from './session-mqtt.listener';

@Module({
  providers: [MqttService, SessionMqttListener],
  exports: [MqttService],
})
export class MqttModule {}
