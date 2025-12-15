import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { StatisticsRepo } from './statistics.repo';

describe('StatisticsController', () => {
  let controller: StatisticsController;
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
      controllers: [StatisticsController],
      providers: [
        StatisticsService,
        { provide: StatisticsRepo, useValue: repo },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
