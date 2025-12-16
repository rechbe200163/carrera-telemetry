import { Injectable } from '@nestjs/common';
import { DriverStandingsRepo } from './driver-standings.repo';
import { DriverStandingsLeaderBoard } from './entities/driver-standings-leaderboard.entity';

@Injectable()
export class DriverStandingsService {
  constructor(
    private readonly driverStandingsRepo: DriverStandingsRepo,
  ) {}

  async recalculateForChampionship(championshipId: number) {
    await this.driverStandingsRepo.recomputeStandingsForChampionship(
      championshipId,
    );
    return this.driverStandingsRepo.getLeaderBoard(championshipId);
  }

  async getLeaderBoard(
    championshipId: number,
  ): Promise<DriverStandingsLeaderBoard[] | null> {
    const raw = await this.driverStandingsRepo.getLeaderBoard(championshipId);
    const data = raw.map((item, idx) => ({
      driver: item.drivers,
      championship: {
        points_total: item.points_total,
        wins: item.wins,
        podiums: item.podiums,
        position: idx + 1,
      },
    }));
    return data;
  }
}
