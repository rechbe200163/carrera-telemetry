import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
export type StandingAggRow = {
  driver_id: number;
  points_total: number;
  wins: number;
  podiums: number;
  races_started: number;
  best_finish_position: number;
};

@Injectable()
export class DriverStandingsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderBoard(championshipId: number) {
    return this.prisma.driver_standings.findMany({
      where: { championship_id: championshipId },
      include: {
        drivers: {
          select: {
            code: true,
            id: true,
            color: true,
            first_name: true,
            last_name: true,
            created_at: true,
          },
        },
      },
      orderBy: [
        { points_total: 'desc' },
        { wins: 'desc' },
        { podiums: 'desc' },
        {
          best_finish_position: {
            sort: 'asc',
            nulls: 'last',
          },
        },
        { driver_id: 'asc' },
      ],
    });
  }

  async recomputeStandingsForChampionship(
    championshipId: number,
  ): Promise<void> {
    // Aggregation aus session_results über finished races im championship
    const rows = await this.prisma.$queryRaw<StandingAggRow[]>`
      SELECT
        sr.driver_id,
        COALESCE(SUM(sr.points_total), 0)::int                                     AS points_total,
        COUNT(*)::int                                                              AS races_started,
        COUNT(*) FILTER (WHERE sr.position = 1)::int                               AS wins,
        COUNT(*) FILTER (WHERE sr.position <= 3)::int                              AS podiums,
        MIN(sr.position)::int                                                      AS best_finish_position
      FROM race_control.session_results sr
      JOIN race_control.sessions s
        ON s.id = sr.session_id
      JOIN race_control.meetings m
        ON m.id = s.meeting_id
      WHERE
        m.championship_id = ${championshipId}
        AND m.status = 'FINISHED'::race_control."Stauts"
        AND s.session_type = 'RACE'::race_control."SessionType"
        AND s.status = 'FINISHED'::race_control."Stauts"
      GROUP BY sr.driver_id
      ORDER BY
        points_total DESC,
        wins DESC,
        podiums DESC,
        best_finish_position ASC,
        sr.driver_id ASC
    `;

    await this.prisma.$transaction(async (tx) => {
      const driverIds = rows.map((r) => r.driver_id);

      if (driverIds.length === 0) {
        await tx.driver_standings.deleteMany({
          where: { championship_id: championshipId },
        });
        return;
      }

      await tx.driver_standings.deleteMany({
        where: {
          championship_id: championshipId,
          driver_id: { notIn: driverIds },
        },
      });

      const now = new Date();
      for (const r of rows) {
        await tx.driver_standings.upsert({
          where: {
            championship_id_driver_id: {
              championship_id: championshipId,
              driver_id: r.driver_id,
            },
          },
          create: {
            championship_id: championshipId,
            driver_id: r.driver_id,
            points_total: r.points_total,
            wins: r.wins,
            podiums: r.podiums,
            races_started: r.races_started,
            best_finish_position: r.best_finish_position,
            last_updated: now,
          },
          update: {
            points_total: r.points_total,
            wins: r.wins,
            podiums: r.podiums,
            races_started: r.races_started,
            best_finish_position: r.best_finish_position,
            last_updated: now,
          },
        });
      }
    });
  }
}
