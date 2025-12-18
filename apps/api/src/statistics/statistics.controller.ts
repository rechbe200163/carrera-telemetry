import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // =========================
  // DRIVER SESSION STATS
  // =========================

  // GET /statistics/sessions/:sessionId/drivers
  @Get('sessions/:sessionId/drivers')
  getDriverSessionStats(@Param('sessionId') sessionId: string) {
    return this.statisticsService.getDriverSessionStats(+sessionId);
  }

  // GET /statistics/drivers/:driverId/sessions?limit=50
  @Get('drivers/:driverId/sessions')
  getDriverSessionStatsForDriver(
    @Param('driverId') driverId: string,
    @Query('limit') limit?: string,
  ) {
    return this.statisticsService.getDriverSessionStatsForDriver(
      +driverId,
      limit ? +limit : 50,
    );
  }

  // =========================
  // SESSION STATS
  // =========================

  // GET /statistics/sessions/:sessionId
  @Get('sessions/:sessionId')
  getSessionStats(@Param('sessionId') sessionId: string) {
    return this.statisticsService.getSessionStats(+sessionId);
  }

  // =========================
  // DRIVER DAILY STATS
  // =========================

  // GET /statistics/drivers/:driverId/daily?days=30
  @Get('drivers/:driverId/daily')
  getDriverDailyStats(
    @Param('driverId') driverId: string,
    @Query('days') days?: string,
  ) {
    return this.statisticsService.getDriverDailyStats(
      +driverId,
      days ? +days : 30,
    );
  }

  // GET /statistics/daily/:day (YYYY-MM-DD)
  @Get('daily/:day')
  getDriverDailyStatsForDay(@Param('day') day: string) {
    return this.statisticsService.getDriverDailyStatsForDay(day);
  }

  @Get('sessions/:sessionId/laps-comparison')
  getLapsComparison(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.statisticsService.getLapsComparisonBySession(sessionId);
  }

  @Get('driver/:id/all-time')
  driverAllTimeStats(@Param('id', ParseIntPipe) id: number) {
    return this.statisticsService.getDriverAllTimeStats(id);
  }
  // =========================
  // MAINTENANCE
  // =========================

  // POST /statistics/rebuild
  // Manuelles Triggern der Nightly Aggregation
  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  aggregateStats() {
    console.log('aggregated Stats');
    return this.statisticsService.aggregateStats();
  }
}
