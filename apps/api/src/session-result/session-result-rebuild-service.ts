import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { SessionsRepo } from 'src/sessions/sessions.repo';
import { SessionType } from 'generated/prisma/enums';

@Injectable()
export class SessionResultsRebuildService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsRepo: SessionsRepo,
  ) {}

  async rebuild(sessionId: number): Promise<void> {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const isRace = session.session_type === SessionType.RACE;

    // Wir rechnen Results wie in calculateSessionResults: nur valid laps
    const laps = await this.prisma.laps.findMany({
      where: { session_id: sessionId },
      select: {
        driver_id: true,
        lap_duration_ms: true,
        is_valid: true,
      },
    });

    type Agg = {
      driverId: number;
      lapsCompleted: number;
      bestLapMs: number | null;
      totalMs: number;
    };

    const byDriver = new Map<number, Agg>();

    for (const lap of laps) {
      if (!lap.is_valid) continue;
      if (lap.lap_duration_ms == null) continue;

      const driverId = lap.driver_id;

      if (!byDriver.has(driverId)) {
        byDriver.set(driverId, {
          driverId,
          lapsCompleted: 0,
          bestLapMs: null,
          totalMs: 0,
        });
      }

      const agg = byDriver.get(driverId)!;
      agg.lapsCompleted += 1;
      agg.totalMs += lap.lap_duration_ms;

      if (agg.bestLapMs === null || lap.lap_duration_ms < agg.bestLapMs) {
        agg.bestLapMs = lap.lap_duration_ms;
      }
    }

    // Build sorted results exakt wie calculateSessionResults
    const sorted = Array.from(byDriver.values())
      .sort((a, b) => {
        if (b.lapsCompleted !== a.lapsCompleted) {
          return b.lapsCompleted - a.lapsCompleted;
        }
        return a.totalMs - b.totalMs;
      })
      .map((agg, index) => {
        const avg =
          agg.lapsCompleted > 0
            ? Math.round(agg.totalMs / agg.lapsCompleted)
            : null;

        const basePoints = this.getPointsForPosition(index + 1, isRace);

        return {
          session_id: sessionId,
          driver_id: agg.driverId,
          position: index + 1,
          laps_completed: agg.lapsCompleted,
          best_lap_ms: agg.bestLapMs,
          avg_lap_ms: avg,
          total_time_ms: agg.totalMs, // Pflichtfeld
          points_base: basePoints,
          points_fastest_lap: 0,
          points_total: basePoints,
        };
      });

    // Fastest Lap Point nur bei RACE (identisch zu deinem Service)
    if (isRace && sorted.length > 0) {
      const candidates = sorted.filter(
        (r) =>
          r.best_lap_ms != null &&
          r.laps_completed != null &&
          r.laps_completed > 0,
      );

      if (candidates.length > 0) {
        const fastest = candidates.reduce(
          (best, curr) => {
            if (!best) return curr;
            if (
              (curr.best_lap_ms ?? Infinity) < (best.best_lap_ms ?? Infinity)
            ) {
              return curr;
            }
            return best;
          },
          null as (typeof candidates)[number] | null,
        );

        if (fastest) {
          for (const r of sorted) {
            if (r.driver_id === fastest.driver_id) {
              r.points_fastest_lap = 1;
              r.points_total = (r.points_total ?? 0) + 1;
              break;
            }
          }
        }
      }
    }

    // Persist (idempotent)
    await this.prisma.$transaction(async (tx) => {
      await tx.session_results.deleteMany({ where: { session_id: sessionId } });

      if (sorted.length > 0) {
        await tx.session_results.createMany({ data: sorted });
      }
    });
  }

  private getPointsForPosition(position: number, isRace: boolean): number {
    if (!isRace) return 0;
    const table = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    return table[position - 1] ?? 0;
  }
}
