import { Test, TestingModule } from '@nestjs/testing';
import { DriverStandingsRepo } from './driver-standings.repo';
import { DriverStandingsService } from './driver-standings.service';

describe('DriverStandingsService', () => {
  let service: DriverStandingsService;
  const repo = {
    getLeaderBoard: jest.fn(),
    recomputeStandingsForChampionship: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverStandingsService,
        { provide: DriverStandingsRepo, useValue: repo },
      ],
    }).compile();

    service = module.get(DriverStandingsService);
    jest.clearAllMocks();
  });

  it('delegates recomputation to repo and returns leaderboard', async () => {
    repo.recomputeStandingsForChampionship.mockResolvedValue(undefined);
    repo.getLeaderBoard.mockResolvedValue([{ points_total: 10 }]);

    const result = await service.recalculateForChampionship(42);

    expect(
      repo.recomputeStandingsForChampionship,
    ).toHaveBeenCalledWith(42);
    expect(repo.getLeaderBoard).toHaveBeenCalledWith(42);
    expect(result).toEqual([{ points_total: 10 }]);
  });

  it('maps leaderboard rows to position-aware DTO', async () => {
    repo.getLeaderBoard.mockResolvedValue([
      {
        drivers: { id: 1, name: 'Max' },
        points_total: 30,
        wins: 2,
        podiums: 3,
      },
      {
        drivers: { id: 2, name: 'Checo' },
        points_total: 20,
        wins: 0,
        podiums: 2,
      },
    ]);

    const data = await service.getLeaderBoard(5);

    expect(repo.getLeaderBoard).toHaveBeenCalledWith(5);
    expect(data).toEqual([
      {
        driver: { id: 1, name: 'Max' },
        championship: {
          points_total: 30,
          wins: 2,
          podiums: 3,
          position: 1,
        },
      },
      {
        driver: { id: 2, name: 'Checo' },
        championship: {
          points_total: 20,
          wins: 0,
          podiums: 2,
          position: 2,
        },
      },
    ]);
  });
});
