import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { DriverStandingsRepo } from './driver-standings.repo';
import { DriverStandingsService } from './driver-standings.service';

describe('DriverStandingsService', () => {
  let service: DriverStandingsService;
  const prisma = {
    session_results: { findMany: jest.fn() },
    driver_standings: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  };
  const repo = { getLeaderBoard: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverStandingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: DriverStandingsRepo, useValue: repo },
      ],
    }).compile();

    service = module.get(DriverStandingsService);
    jest.clearAllMocks();
  });

  it('clears standings when no results exist', async () => {
    prisma.session_results.findMany.mockResolvedValue([]);
    prisma.driver_standings.deleteMany.mockResolvedValue({});

    await service.recalculateForChampionship(1);

    expect(prisma.driver_standings.deleteMany).toHaveBeenCalledWith({
      where: { championship_id: 1 },
    });
    expect(prisma.driver_standings.create).not.toHaveBeenCalled();
  });

  it('aggregates results and rewrites standings', async () => {
    prisma.session_results.findMany.mockResolvedValue([
      {
        driver_id: 10,
        points_total: 25,
        position: 1,
        sessions: { session_type: 'RACE' },
      },
      {
        driver_id: 10,
        points_total: 5,
        position: 2,
        sessions: { session_type: 'PRACTICE' },
      },
      {
        driver_id: 11,
        points_total: 18,
        position: 2,
        sessions: { session_type: 'RACE' },
      },
    ]);
    prisma.driver_standings.deleteMany.mockResolvedValue({});
    prisma.driver_standings.create.mockResolvedValue({});

    const res = await service.recalculateForChampionship(7);

    expect(prisma.driver_standings.deleteMany).toHaveBeenCalledWith({
      where: { championship_id: 7 },
    });
    expect(prisma.driver_standings.create).toHaveBeenCalledTimes(2);
    expect(prisma.driver_standings.create).toHaveBeenCalledWith({
      data: {
        championship_id: 7,
        driver_id: 10,
        points_total: 30,
        wins: 1,
        podiums: 1,
        races_started: 1,
      },
    });
    expect(prisma.driver_standings.create).toHaveBeenCalledWith({
      data: {
        championship_id: 7,
        driver_id: 11,
        points_total: 18,
        wins: 0,
        podiums: 1,
        races_started: 1,
      },
    });
    expect(res).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ driver_id: 10, points_total: 30 }),
        expect.objectContaining({ driver_id: 11, points_total: 18 }),
      ]),
    );
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
