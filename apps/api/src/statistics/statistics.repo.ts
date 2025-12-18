import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

/**
 * Repo ist READ-ONLY für den Rest der App (du "gettest" hier),
 * aber enthält bewusst die nightly Upsert-Aggregationen als Bulk SQL,
 * weil Prisma groupBy keinen Median/P90/Stddev sauber kann.
 */
@Injectable()
export class StatisticsRepo {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // Nightly aggregation UPSERT
  // =========================
  /**
   * Convenience: alle 3 Aggregationen in einer Transaktion.
   * (Das callst du aus dem Cron-Service.)
   */
  async upsertAllNightly(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.$executeRaw`SELECT 1`, // keeps tx array non-empty even if you toggle methods
    ]);

    // Prisma erlaubt keine "lazy" $executeRaw in tx-array, daher: direkt so:
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO race_control.driver_all_time_stats (driver_id, computed_at)
        SELECT d.id, NOW()::timestamp(6)
        FROM race_control.drivers d
        ON CONFLICT (driver_id) DO NOTHING;
      `;

      await tx.$executeRaw`
        INSERT INTO race_control.driver_session_stats (
          session_id, driver_id,
          laps_total, laps_valid, laps_invalid,
          best_lap_ms, avg_lap_ms, median_lap_ms, p90_lap_ms, stddev_lap_ms,
          best_s1_ms, best_s2_ms, best_s3_ms,
          avg_s1_ms, avg_s2_ms, avg_s3_ms,
          stddev_s1_ms, stddev_s2_ms, stddev_s3_ms,
          theoretical_best_ms, computed_at
        )
        SELECT
          l.session_id, l.driver_id,
          COUNT(*)::int,
          COUNT(*) FILTER (WHERE l.is_valid)::int,
          COUNT(*) FILTER (WHERE NOT l.is_valid)::int,
          MIN(l.lap_duration_ms) FILTER (WHERE l.is_valid),
          (AVG(l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          (PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          STDDEV_POP(l.lap_duration_ms) FILTER (WHERE l.is_valid),
          MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL),
          MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL),
          MIN(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),
          (AVG(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL))::int,
          (AVG(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL))::int,
          (AVG(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL))::int,
          STDDEV_POP(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL),
          STDDEV_POP(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL),
          STDDEV_POP(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),
          CASE
            WHEN
              MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL) IS NOT NULL
              AND MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL) IS NOT NULL
            THEN
              (
                MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL)
                + MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL)
                + COALESCE(
                    MIN(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),
                    0
                  )
              )
            ELSE NULL
          END,
          NOW()::timestamp(6)
        FROM race_control.laps l
        GROUP BY l.session_id, l.driver_id
        ON CONFLICT (session_id, driver_id)
        DO UPDATE SET
          laps_total          = EXCLUDED.laps_total,
          laps_valid          = EXCLUDED.laps_valid,
          laps_invalid        = EXCLUDED.laps_invalid,
          best_lap_ms         = EXCLUDED.best_lap_ms,
          avg_lap_ms          = EXCLUDED.avg_lap_ms,
          median_lap_ms       = EXCLUDED.median_lap_ms,
          p90_lap_ms          = EXCLUDED.p90_lap_ms,
          stddev_lap_ms       = EXCLUDED.stddev_lap_ms,
          best_s1_ms          = EXCLUDED.best_s1_ms,
          best_s2_ms          = EXCLUDED.best_s2_ms,
          best_s3_ms          = EXCLUDED.best_s3_ms,
          avg_s1_ms           = EXCLUDED.avg_s1_ms,
          avg_s2_ms           = EXCLUDED.avg_s2_ms,
          avg_s3_ms           = EXCLUDED.avg_s3_ms,
          stddev_s1_ms        = EXCLUDED.stddev_s1_ms,
          stddev_s2_ms        = EXCLUDED.stddev_s2_ms,
          stddev_s3_ms        = EXCLUDED.stddev_s3_ms,
          theoretical_best_ms = EXCLUDED.theoretical_best_ms,
          computed_at         = EXCLUDED.computed_at;
      `;

      await tx.$executeRaw`
        INSERT INTO race_control.session_stats (
          session_id,
          laps_total,
          laps_valid,
          laps_invalid,
          best_lap_ms,
          median_lap_ms,
          p90_lap_ms,
          stddev_lap_ms,
          computed_at
        )
        SELECT
          l.session_id,
          COUNT(*)::int,
          COUNT(*) FILTER (WHERE l.is_valid)::int,
          COUNT(*) FILTER (WHERE NOT l.is_valid)::int,
          MIN(l.lap_duration_ms) FILTER (WHERE l.is_valid),
          (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          (PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          STDDEV_POP(l.lap_duration_ms) FILTER (WHERE l.is_valid),
          NOW()::timestamp(6)
        FROM race_control.laps l
        GROUP BY l.session_id
        ON CONFLICT (session_id)
        DO UPDATE SET
          laps_total    = EXCLUDED.laps_total,
          laps_valid    = EXCLUDED.laps_valid,
          laps_invalid  = EXCLUDED.laps_invalid,
          best_lap_ms   = EXCLUDED.best_lap_ms,
          median_lap_ms = EXCLUDED.median_lap_ms,
          p90_lap_ms    = EXCLUDED.p90_lap_ms,
          stddev_lap_ms = EXCLUDED.stddev_lap_ms,
          computed_at   = EXCLUDED.computed_at;
      `;

      await tx.$executeRaw`
        INSERT INTO race_control.driver_daily_stats (
          driver_id,
          day,
          laps_total,
          laps_valid,
          laps_invalid,
          best_lap_ms,
          avg_lap_ms,
          median_lap_ms,
          p90_lap_ms,
          stddev_lap_ms,
          best_s1_ms,
          best_s2_ms,
          best_s3_ms,
          avg_s1_ms,
          avg_s2_ms,
          avg_s3_ms,
          theoretical_best_ms,
          computed_at
        )
        SELECT
          l.driver_id,
          (l.date_start::date),
          COUNT(*)::int,
          COUNT(*) FILTER (WHERE l.is_valid)::int,
          COUNT(*) FILTER (WHERE NOT l.is_valid)::int,
          MIN(l.lap_duration_ms) FILTER (WHERE l.is_valid),
          (AVG(l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          (PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
          STDDEV_POP(l.lap_duration_ms) FILTER (WHERE l.is_valid),
          MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL),
          MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL),
          MIN(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),
          (AVG(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL))::int,
          (AVG(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL))::int,
          (AVG(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL))::int,
          CASE
          WHEN
            MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL) IS NOT NULL
            AND MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL) IS NOT NULL
          THEN
            (
              MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL)
              + MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL)
              + COALESCE(
                  MIN(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),
                  0
                )
            )
          ELSE NULL
        END,
          NOW()::timestamp(6)
        FROM race_control.laps l
        GROUP BY l.driver_id, (l.date_start::date)
        ON CONFLICT (driver_id, day)
        DO UPDATE SET
          laps_total          = EXCLUDED.laps_total,
          laps_valid          = EXCLUDED.laps_valid,
          laps_invalid        = EXCLUDED.laps_invalid,
          best_lap_ms         = EXCLUDED.best_lap_ms,
          avg_lap_ms          = EXCLUDED.avg_lap_ms,
          median_lap_ms       = EXCLUDED.median_lap_ms,
          p90_lap_ms          = EXCLUDED.p90_lap_ms,
          stddev_lap_ms       = EXCLUDED.stddev_lap_ms,
          best_s1_ms          = EXCLUDED.best_s1_ms,
          best_s2_ms          = EXCLUDED.best_s2_ms,
          best_s3_ms          = EXCLUDED.best_s3_ms,
          avg_s1_ms           = EXCLUDED.avg_s1_ms,
          avg_s2_ms           = EXCLUDED.avg_s2_ms,
          avg_s3_ms           = EXCLUDED.avg_s3_ms,
          theoretical_best_ms = EXCLUDED.theoretical_best_ms,
          computed_at         = EXCLUDED.computed_at;
      `;

      await tx.$executeRaw`
      INSERT INTO race_control.driver_all_time_stats (
      driver_id,
      laps_total, laps_valid, laps_invalid,
      best_lap_ms, avg_lap_ms, median_lap_ms, p90_lap_ms, stddev_lap_ms,
      best_s1_ms, best_s2_ms, best_s3_ms,
      avg_s1_ms, avg_s2_ms, avg_s3_ms,
      stddev_s1_ms, stddev_s2_ms, stddev_s3_ms,
      theoretical_best_ms,
      first_lap_at, last_lap_at,
      computed_at
    )
    SELECT
      l.driver_id,

      COUNT(*)::int,
      COUNT(*) FILTER (WHERE l.is_valid)::int,
      COUNT(*) FILTER (WHERE NOT l.is_valid)::int,

      MIN(l.lap_duration_ms) FILTER (WHERE l.is_valid),
      (AVG(l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
      (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
      (PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY l.lap_duration_ms) FILTER (WHERE l.is_valid))::int,
      STDDEV_POP(l.lap_duration_ms) FILTER (WHERE l.is_valid),

      MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL),
      MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL),
      MIN(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),

      (AVG(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL))::int,
      (AVG(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL))::int,
      (AVG(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL))::int,

      STDDEV_POP(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL),
      STDDEV_POP(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL),
      STDDEV_POP(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),

      CASE
        WHEN
          MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL) IS NOT NULL
          AND MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL) IS NOT NULL
        THEN
          (
            MIN(l.duration_sector1) FILTER (WHERE l.is_valid AND l.duration_sector1 IS NOT NULL)
            + MIN(l.duration_sector2) FILTER (WHERE l.is_valid AND l.duration_sector2 IS NOT NULL)
            + COALESCE(
                MIN(l.duration_sector3) FILTER (WHERE l.is_valid AND l.duration_sector3 IS NOT NULL),
                0
              )
          )
        ELSE NULL
      END,

      MIN(l.date_start),
      MAX(l.date_start),

      NOW()::timestamp(6)
    FROM race_control.laps l
    GROUP BY l.driver_id
    ON CONFLICT (driver_id)
    DO UPDATE SET
      laps_total          = EXCLUDED.laps_total,
      laps_valid          = EXCLUDED.laps_valid,
      laps_invalid        = EXCLUDED.laps_invalid,
      best_lap_ms         = EXCLUDED.best_lap_ms,
      avg_lap_ms          = EXCLUDED.avg_lap_ms,
      median_lap_ms       = EXCLUDED.median_lap_ms,
      p90_lap_ms          = EXCLUDED.p90_lap_ms,
      stddev_lap_ms       = EXCLUDED.stddev_lap_ms,

      best_s1_ms          = EXCLUDED.best_s1_ms,
      best_s2_ms          = EXCLUDED.best_s2_ms,
      best_s3_ms          = EXCLUDED.best_s3_ms,
      avg_s1_ms           = EXCLUDED.avg_s1_ms,
      avg_s2_ms           = EXCLUDED.avg_s2_ms,
      avg_s3_ms           = EXCLUDED.avg_s3_ms,
      stddev_s1_ms        = EXCLUDED.stddev_s1_ms,
      stddev_s2_ms        = EXCLUDED.stddev_s2_ms,
      stddev_s3_ms        = EXCLUDED.stddev_s3_ms,

      theoretical_best_ms = EXCLUDED.theoretical_best_ms,
      first_lap_at        = LEAST(race_control.driver_all_time_stats.first_lap_at, EXCLUDED.first_lap_at),
      last_lap_at         = GREATEST(race_control.driver_all_time_stats.last_lap_at, EXCLUDED.last_lap_at),
      computed_at         = EXCLUDED.computed_at;
      `;

      await tx.$executeRaw`
      UPDATE race_control.driver_all_time_stats a
      SET
        sessions_total       = x.sessions_total,
        races_started        = x.races_started,
        wins                 = x.wins,
        p2_finishes          = x.p2_finishes,
        p3_finishes          = x.p3_finishes,
        best_finish_position = x.best_finish_position,
        avg_finish_position  = x.avg_finish_position,
        computed_at          = NOW()::timestamp(6)
      FROM (
        SELECT
          sr.driver_id,

          -- alle FINISHED Sessions (egal type)
          COUNT(*) FILTER (WHERE s.status = 'FINISHED')::int AS sessions_total,

          -- FINISHED RACE Sessions
          COUNT(*) FILTER (WHERE s.status = 'FINISHED' AND s.session_type = 'RACE')::int AS races_started,

          -- Platzierungen nur für FINISHED RACE
          COUNT(*) FILTER (WHERE s.status = 'FINISHED' AND s.session_type = 'RACE' AND sr.position = 1)::int AS wins,
          COUNT(*) FILTER (WHERE s.status = 'FINISHED' AND s.session_type = 'RACE' AND sr.position = 2)::int AS p2_finishes,
          COUNT(*) FILTER (WHERE s.status = 'FINISHED' AND s.session_type = 'RACE' AND sr.position = 3)::int AS p3_finishes,

          -- best / avg finish nur FINISHED RACE
          MIN(sr.position) FILTER (WHERE s.status = 'FINISHED' AND s.session_type = 'RACE')::int AS best_finish_position,
          AVG(sr.position) FILTER (WHERE s.status = 'FINISHED' AND s.session_type = 'RACE')       AS avg_finish_position

        FROM race_control.session_results sr
        JOIN race_control.sessions s
          ON s.id = sr.session_id
        GROUP BY sr.driver_id
      ) x
      WHERE a.driver_id = x.driver_id;
    `;
    });
  }

  // =========================
  // READ methods (GET only)
  // =========================

  async getDriverSessionStats(sessionId: number) {
    return this.prisma.driver_session_stats.findMany({
      where: { session_id: sessionId },
      include: {
        drivers: true,
        sessions: true,
      },
      orderBy: [{ best_lap_ms: 'asc' }, { laps_valid: 'desc' }],
    });
  }

  async getDriverSessionStatsForDriver(driverId: number, limit = 50) {
    return this.prisma.driver_session_stats.findMany({
      where: { driver_id: driverId },
      include: { sessions: true },
      orderBy: { computed_at: 'desc' },
      take: limit,
    });
  }

  async getSessionStats(sessionId: number) {
    return this.prisma.session_stats.findUnique({
      where: { session_id: sessionId },
      include: { sessions: true },
    });
  }

  async getDriverDailyStats(driverId: number, days = 30) {
    return this.prisma.driver_daily_stats.findMany({
      where: { driver_id: driverId },
      orderBy: { day: 'desc' },
      take: days,
    });
  }

  async getDriverDailyStatsForDay(day: string /* YYYY-MM-DD */) {
    return this.prisma.driver_daily_stats.findMany({
      where: { day: new Date(day) },
      include: { drivers: true },
      orderBy: [{ best_lap_ms: 'asc' }],
    });
  }

  async getDriverAllTimeStats(driverId: number) {
    return this.prisma.driver_all_time_stats.findUnique({
      where: { driver_id: driverId },
    });
  }
}
