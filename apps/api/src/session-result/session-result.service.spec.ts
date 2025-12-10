import { Test, TestingModule } from '@nestjs/testing';
import { SessionType } from 'generated/prisma/enums';
import { LapsRepo } from 'src/laps/laps.repo';
import { SessionsRepo } from 'src/sessions/sessions.repo';
import { SessionResultsRepo } from './session-result.repo';
import { SessionResultsService } from './session-result.service';

describe('SessionResultsService', () => {
  let service: SessionResultsService;
  const lapsRepo = { findBySession: jest.fn() };
  const sessionsRepo = { findById: jest.fn() };
  const sessionResultsRepo = { createSessionResultsForSessionAndDriver: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionResultsService,
        { provide: LapsRepo, useValue: lapsRepo },
        { provide: SessionsRepo, useValue: sessionsRepo },
        { provide: SessionResultsRepo, useValue: sessionResultsRepo },
      ],
    }).compile();

    service = module.get(SessionResultsService);
    jest.clearAllMocks();
  });

  it('throws when the session cannot be found', async () => {
    sessionsRepo.findById.mockResolvedValue(null);

    await expect(service.calculateSessionResults(123)).rejects.toThrow('Session 123 not found');

    expect(sessionsRepo.findById).toHaveBeenCalledWith(123);
    expect(sessionResultsRepo.createSessionResultsForSessionAndDriver).not.toHaveBeenCalled();
  });

  it('calculates race results with sorting, averages, and fastest-lap bonus', async () => {
    sessionsRepo.findById.mockResolvedValue({ id: 1, session_type: SessionType.RACE });
    lapsRepo.findBySession.mockResolvedValue([
      // driver 1: two valid laps, one invalid lap that should be ignored
      { driver_id: 1, lap_duration_ms: 1000, is_valid: true },
      { driver_id: 1, lap_duration_ms: 950, is_valid: true },
      { driver_id: 1, lap_duration_ms: 9999, is_valid: false },
      // driver 2: slower total time but fastest single lap
      { driver_id: 2, lap_duration_ms: 900, is_valid: true },
      { driver_id: 2, lap_duration_ms: 1150, is_valid: true },
    ]);
    sessionResultsRepo.createSessionResultsForSessionAndDriver.mockResolvedValue(undefined);

    const results = await service.calculateSessionResults(1);

    expect(results).toEqual([
      {
        session_id: 1,
        driver_id: 1,
        position: 1,
        laps_completed: 2,
        best_lap_ms: 950,
        avg_lap_ms: 975,
        total_time_ms: 1950,
        points_base: 25,
        points_fastest_lap: 0,
        points_total: 25,
      },
      {
        session_id: 1,
        driver_id: 2,
        position: 2,
        laps_completed: 2,
        best_lap_ms: 900,
        avg_lap_ms: 1025,
        total_time_ms: 2050,
        points_base: 18,
        points_fastest_lap: 1,
        points_total: 19,
      },
    ]);
    expect(sessionResultsRepo.createSessionResultsForSessionAndDriver).toHaveBeenCalledWith(results);
  });

  it('sets zero points and no fastest-lap bonus for non-race sessions', async () => {
    sessionsRepo.findById.mockResolvedValue({ id: 2, session_type: SessionType.PRACTICE });
    lapsRepo.findBySession.mockResolvedValue([
      { driver_id: 3, lap_duration_ms: 1200, is_valid: true },
      { driver_id: 4, lap_duration_ms: 1100, is_valid: true },
    ]);
    sessionResultsRepo.createSessionResultsForSessionAndDriver.mockResolvedValue(undefined);

    const results = await service.calculateSessionResults(2);

    expect(results).toEqual([
      {
        session_id: 2,
        driver_id: 4,
        position: 1,
        laps_completed: 1,
        best_lap_ms: 1100,
        avg_lap_ms: 1100,
        total_time_ms: 1100,
        points_base: 0,
        points_fastest_lap: 0,
        points_total: 0,
      },
      {
        session_id: 2,
        driver_id: 3,
        position: 2,
        laps_completed: 1,
        best_lap_ms: 1200,
        avg_lap_ms: 1200,
        total_time_ms: 1200,
        points_base: 0,
        points_fastest_lap: 0,
        points_total: 0,
      },
    ]);
    expect(sessionResultsRepo.createSessionResultsForSessionAndDriver).toHaveBeenCalledWith(results);
  });
});
