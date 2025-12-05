import { Injectable } from '@nestjs/common';
import { LapsRepo } from 'src/laps/laps.repo';
import { SessionResultsRepo } from './session-result.repo';
import { SessionResult } from './entities/session-result.entity';

@Injectable()
export class SessionResultsService {
  constructor(
    private readonly lapsRepo: LapsRepo,
    private readonly sessionResultsRepo: SessionResultsRepo,
  ) {}

  async calculateSessionResults(sessionId: number) {
    const laps = await this.lapsRepo.findBySession(sessionId);

    if (!laps.length) {
      // nichts zu tun
      return [];
    }

    // 1) Aggregation pro Driver
    type Agg = {
      driver_id: number;
      laps_completed: number;
      best_lap_ms: number;
      avg_lap_ms: number;
      standard_deviation: number;
      total_time_ms: number;
    };

    const byDriver = new Map<number, Agg>();

    for (const lap of laps) {
      if (!lap.is_valid) continue;

      const existing = byDriver.get(lap.driver_id);
      if (!existing) {
        byDriver.set(lap.driver_id, {
          driver_id: lap.driver_id,
          laps_completed: 1,
          best_lap_ms: lap.lap_duration_ms,
          avg_lap_ms: lap.lap_duration_ms,
          standard_deviation: 0,
          total_time_ms: lap.lap_duration_ms,
        });
      } else {
        existing.laps_completed += 1;
        existing.total_time_ms += lap.lap_duration_ms;
        if (lap.lap_duration_ms < existing.best_lap_ms) {
          existing.best_lap_ms = lap.lap_duration_ms;
        }
      }
    }

    // Durchschnittszeit berechnen
    for (const agg of byDriver.values()) {
      agg.avg_lap_ms = Math.round(agg.total_time_ms / agg.laps_completed);
    }

    // std. dev. of laps
    for (const agg of byDriver.values()) {
    }

    // 2) Sortierung für Positionen:
    // - viele Laps zuerst
    // - bei Gleichstand: geringere total_time_ms zuerst
    const ranking = Array.from(byDriver.values()).sort((a, b) => {
      if (b.laps_completed !== a.laps_completed) {
        return b.laps_completed - a.laps_completed;
      }
      return a.total_time_ms - b.total_time_ms;
    });

    // 3) SessionResults schreiben (Position, Zeiten, keine Punkte)
    let position = 1;
    const results: SessionResult[] = [];

    for (const agg of ranking) {
      const result = await this.sessionResultsRepo.upsertForSessionAndDriver(
        sessionId,
        agg.driver_id,
        {
          position,
          best_lap_ms: agg.best_lap_ms,
          avg_lap_ms: agg.avg_lap_ms,
          laps_completed: agg.laps_completed,
          points_base: 0,
          points_fastest_lap: 0,
          points_total: 0,
        },
      );
      results.push(result);
      position++;
    }

    return results;
  }
}
