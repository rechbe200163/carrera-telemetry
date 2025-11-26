import { PartialType } from '@nestjs/mapped-types';
import { CreateCarTelemetryDto } from './create-car-telemetry.dto';

export class UpdateCarTelemetryDto extends PartialType(CreateCarTelemetryDto) {
  id: number;
}
