import { Module } from '@nestjs/common';
import { CarTelemetryService } from './car-telemetry.service';
import { CarTelemetryController } from './car-telemetry.controller';

@Module({
  controllers: [CarTelemetryController],
  providers: [CarTelemetryService],
})
export class CarTelemetryModule {}
