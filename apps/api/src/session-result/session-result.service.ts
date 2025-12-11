import { Injectable } from '@nestjs/common';
import { LapsRepo } from 'src/laps/laps.repo';
import { SessionResultsRepo } from './session-result.repo';
import { SessionType } from 'generated/prisma/enums';
import { SessionsRepo } from 'src/sessions/sessions.repo';
import { CreateSessionResultDto } from './dto/create-session-result.dto';

@Injectable()
export class SessionResultsService {
  constructor(
    private readonly lapsRepo: LapsRepo,
    private readonly sessionResultsRepo: SessionResultsRepo,
    private readonly sessionsRepo: SessionsRepo,
  ) {}

  async getResultsBySessionId(id: number) {
    return this.sessionResultsRepo.findBySession(id);
  }

  async calculateSessionResults(sessionId: number) {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const isRace = session.session_type === SessionType.RACE;

    const laps = await this.lapsRepo.findBySession(sessionId);

    type Agg = {
      driverId: number;
      lapsCompleted: number;
      bestLapMs: number | null;
      totalMs: number;
    };

    const byDriver = new Map<number, Agg>();

    for (const lap of laps) {
      if (!lap.is_valid) continue;

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

    // in sortierte Ergebnisliste umwandeln (Position, Basiswerte)

    // ...

    const sorted: CreateSessionResultDto[] = Array.from(byDriver.values())
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
          total_time_ms: agg.totalMs, // 🔥 HIER: Pflichtfeld gesetzt
          points_base: basePoints,
          points_fastest_lap: 0,
          points_total: basePoints,
        };
      });

    // 🔥 Fastest Lap Point nur bei RACE
    if (isRace && sorted.length > 0) {
      // 1) Kandidaten für Fastest Lap filtern
      // hier könntest du noch zusätzliche Bedingungen hinzufügen:
      // z.B. r.position <= 10 oder r.laps_completed >= irgendwas
      const candidates = sorted.filter(
        (r) =>
          r.best_lap_ms != null && r.laps_completed && r.laps_completed > 0,
      );

      if (candidates.length > 0) {
        // 2) Fahrer mit der kleinsten best_lap_ms finden
        const fastest = candidates.reduce((best, curr) => {
          if (!best) return curr;
          if ((curr.best_lap_ms ?? Infinity) < (best.best_lap_ms ?? Infinity)) {
            return curr;
          }
          return best;
        });

        // 3) Punkt vergeben
        for (const r of sorted) {
          if (r.driver_id === fastest.driver_id) {
            r.points_fastest_lap = 1;
            r.points_total = (r.points_total ?? 0) + 1;
            break;
          }
        }
      }
    }

    // 👇 hier wirklich in die DB schreiben
    await this.sessionResultsRepo.createSessionResultsForSessionAndDriver(
      sorted,
    );

    return sorted;
  }

  private getPointsForPosition(position: number, isRace: boolean): number {
    if (!isRace) return 0; // PRACTICE / QUALYFING / FUN => keine Punkte

    const table = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    return table[position - 1] ?? 0;
  }
}
