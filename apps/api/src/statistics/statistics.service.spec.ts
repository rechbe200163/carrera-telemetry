import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { StatisticsRepo } from './statistics.repo';

describe('StatisticsService', () => {
  let service: StatisticsService;
  const repo = {
    getDriverSessionStats: jest.fn(),
    getDriverSessionStatsForDriver: jest.fn(),
    getSessionStats: jest.fn(),
    getDriverDailyStats: jest.fn(),
    getDriverDailyStatsForDay: jest.fn(),
    upsertAllNightly: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: StatisticsRepo, useValue: repo },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
