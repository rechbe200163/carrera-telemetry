import { Injectable, Logger } from '@nestjs/common';
import { StatisticsRepo } from './statistics.repo';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly statisticsRepo: StatisticsRepo) {}

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

  // =========================
  // MAINTENANCE / CRON
  // =========================

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async rebuildAll() {
    this.logger.warn('Manual statistics rebuild triggered');
    await this.statisticsRepo.upsertAllNightly();
    return { status: 'ok', rebuiltAt: new Date().toISOString() };
  }
}
