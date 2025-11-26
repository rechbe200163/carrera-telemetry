import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { MqttService } from './mqtt.service';
import { Topics } from '../../lib/mqtt.topics';

@Controller()
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}
  private readonly logger = new Logger(MqttController.name);

  @EventPattern(Topics.carTelemetry())
  handleCarTelemetry(@Payload() data: any) {
    this.logger.log(`Received car telemetry: ${JSON.stringify(data)}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);
  }
}
