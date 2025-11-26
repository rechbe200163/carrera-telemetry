import { Test, TestingModule } from '@nestjs/testing';
import { CarTelemetryService } from './car-telemetry.service';

describe('CarTelemetryService', () => {
  let service: CarTelemetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarTelemetryService],
    }).compile();

    service = module.get<CarTelemetryService>(CarTelemetryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
