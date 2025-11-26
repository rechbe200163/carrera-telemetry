import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CarTelemetryService } from './car-telemetry.service';
import { Topics } from 'lib/mqtt.topics';

@Controller()
export class CarTelemetryController {
  constructor(private readonly carTelemetryService: CarTelemetryService) {}
  private readonly logger = new Logger(CarTelemetryController.name);

  @EventPattern(Topics.carTelemetry())
  handleCarTelemetry(@Payload() data: any) {
    this.logger.log(`Received car telemetry: ${JSON.stringify(data)}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);
  }
}
