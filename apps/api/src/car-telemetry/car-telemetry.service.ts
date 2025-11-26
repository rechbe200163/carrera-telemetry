import { Injectable } from '@nestjs/common';
import { CreateCarTelemetryDto } from './dto/create-car-telemetry.dto';
import { UpdateCarTelemetryDto } from './dto/update-car-telemetry.dto';

@Injectable()
export class CarTelemetryService {
  create(createCarTelemetryDto: CreateCarTelemetryDto) {
    return 'This action adds a new carTelemetry';
  }

  findAll() {
    return `This action returns all carTelemetry`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carTelemetry`;
  }

  update(id: number, updateCarTelemetryDto: UpdateCarTelemetryDto) {
    return `This action updates a #${id} carTelemetry`;
  }

  remove(id: number) {
    return `This action removes a #${id} carTelemetry`;
  }
}
