import { Injectable, Logger } from '@nestjs/common';
import { StatisticsRepo } from './statistics.repo';
import { SessionEntriesRepo } from 'src/session-entry/session-entry.repo';
import { LapsRepo } from 'src/laps/laps.repo';

type LapsComparisonResponse = {
  sessionId: number;
  sessionStats?: {
    p90_lap_ms: number | null;
  };
  drivers: Array<{
    driver: {
      id: number;
      code: string;
      color: string;
      first_name: string;
      last_name: string;
    };
    laps: Array<{
      lap_number: number;
      lap_duration_ms: number;
      is_valid: boolean;
    }>;
    stats?: {
      avg_lap_ms: number | null;
      stddev_lap_ms: number | null;
      p90_lap_ms: number | null;
      best_lap_ms: number | null;
      theoretical_best_ms: number | null;
    };
  }>;
};

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    private readonly statisticsRepo: StatisticsRepo,
    private readonly sessionEntriesRepo: SessionEntriesRepo,
    private readonly lapsRepo: LapsRepo,
  ) {}

  // =========================
  // READ METHODS
  // =========================

  getDriverSessionStats(sessionId: number) {
    return this.statisticsRepo.getDriverSessionStats(sessionId);
  }

  getDriverSessionStatsForDriver(driverId: number, limit: number) {
    return this.statisticsRepo.getDriverSessionStatsForDriver(driverId, limit);
  }

  getSessionStats(sessionId: number) {
    return this.statisticsRepo.getSessionStats(sessionId);
  }

  getDriverDailyStats(driverId: number, days: number) {
    return this.statisticsRepo.getDriverDailyStats(driverId, days);
  }

  getDriverDailyStatsForDay(day: string) {
    return this.statisticsRepo.getDriverDailyStatsForDay(day);
  }

  getDriverAllTimeStats(driverId: number) {
    return this.statisticsRepo.getDriverAllTimeStats(driverId);
  }

  async getLapsComparisonBySession(
    sessionId: number,
  ): Promise<LapsComparisonResponse> {
    // 1) Fahrer der Session (mit Meta)
    const entries =
      await this.sessionEntriesRepo.listEntriesForSessionStats(sessionId);

    // 2) Alle Laps der Session (nur needed fields)
    const laps = await this.lapsRepo.findBySession(sessionId, {
      driver_id: true,
      lap_number: true,
      lap_duration_ms: true,
      is_valid: true,
    });

    // 3) Driver Session Stats (optional, kann fehlen wenn nightly / noch nicht computed)
    const dss = await this.statisticsRepo.getDriverSessionStats(sessionId);

    // 4) Session Stats (optional)
    const ss = await this.statisticsRepo.getSessionStats(sessionId);
    console.log('ss', ss);
    // ---- Maps bauen (schnell & sauber) ----
    const lapsByDriver = new Map<
      number,
      Array<{ lap_number: number; lap_duration_ms: number; is_valid: boolean }>
    >();
    for (const l of laps) {
      const arr = lapsByDriver.get(l.driver_id) ?? [];
      arr.push({
        lap_number: l.lap_number,
        lap_duration_ms: l.lap_duration_ms,
        is_valid: l.is_valid,
      });
      lapsByDriver.set(l.driver_id, arr);
    }

    const statsByDriver = new Map<
      number,
      LapsComparisonResponse['drivers'][number]['stats']
    >();
    for (const s of dss) {
      statsByDriver.set(s.driver_id, {
        avg_lap_ms: s.avg_lap_ms ?? null,
        stddev_lap_ms: s.stddev_lap_ms ?? null,
        p90_lap_ms: s.p90_lap_ms ?? null,
        best_lap_ms: s.best_lap_ms ?? null,
        theoretical_best_ms: s.theoretical_best_ms ?? null,
      });
    }

    // ---- Response bauen ----
    const drivers = entries.map((e) => ({
      driver: {
        id: e.drivers.id,
        code: e.drivers.code,
        color: e.drivers.color,
        first_name: e.drivers.first_name,
        last_name: e.drivers.last_name,
      },
      laps: lapsByDriver.get(e.driver_id) ?? [],
      stats: statsByDriver.get(e.driver_id), // kann undefined sein -> FE kann fallbacken
    }));

    return {
      sessionId,
      sessionStats: ss ? { p90_lap_ms: ss.p90_lap_ms ?? null } : undefined,
      drivers,
    };
  }

  // =========================
  // MAINTENANCE / CRON
  // =========================
  async aggregateStats() {
    this.logger.warn('Manual statistics rebuild triggered');
    await this.statisticsRepo.upsertAllNightly();
    return { status: 'ok', rebuiltAt: new Date().toISOString() };
  }
}
