import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DriverStandingsRepo } from './driver-standings.repo';
import { DriverStandingsLeaderBoard } from './entities/driver-standings-leaderboard.entity';

@Injectable()
export class DriverStandingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driverStandingsRepo: DriverStandingsRepo,
  ) {}

  async recalculateForChampionship(championshipId: number) {
    // alle SessionResults der Championship holen
    const results = await this.prisma.session_results.findMany({
      where: {
        sessions: {
          meetings: {
            championship_id: championshipId,
          },
        },
      },
      include: {
        sessions: {
          select: { session_type: true },
        },
      },
    });

    if (!results.length) {
      // standings leeren
      await this.prisma.driver_standings.deleteMany({
        where: { championship_id: championshipId },
      });
      return;
    }

    // Aggregation pro Driver
    type Agg = {
      driver_id: number;
      points_total: number;
      wins: number;
      podiums: number;
      races_started: number;
    };

    const byDriver = new Map<number, Agg>();

    for (const r of results) {
      const isRace = r.sessions.session_type === 'RACE';

      const agg = byDriver.get(r.driver_id) ?? {
        driver_id: r.driver_id,
        points_total: 0,
        wins: 0,
        podiums: 0,
        races_started: 0,
      };

      agg.points_total += r.points_total ?? 0;

      if (isRace) {
        agg.races_started += 1;
        if (r.position === 1) agg.wins += 1;
        if (r.position <= 3) agg.podiums += 1;
      }

      byDriver.set(r.driver_id, agg);
    }

    // Alte Standings löschen
    await this.prisma.driver_standings.deleteMany({
      where: { championship_id: championshipId },
    });

    // Neue Standings schreiben
    const aggregates = Array.from(byDriver.values());

    for (const agg of aggregates) {
      await this.prisma.driver_standings.create({
        data: {
          championship_id: championshipId,
          driver_id: agg.driver_id,
          points_total: agg.points_total,
          wins: agg.wins,
          podiums: agg.podiums,
          races_started: agg.races_started,
        },
      });
    }

    return aggregates;
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
