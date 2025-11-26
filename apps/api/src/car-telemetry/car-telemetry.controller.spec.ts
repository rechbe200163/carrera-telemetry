import { Test, TestingModule } from '@nestjs/testing';
import { CarTelemetryController } from './car-telemetry.controller';
import { CarTelemetryService } from './car-telemetry.service';

describe('CarTelemetryController', () => {
  let controller: CarTelemetryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarTelemetryController],
      providers: [CarTelemetryService],
    }).compile();

    controller = module.get<CarTelemetryController>(CarTelemetryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
