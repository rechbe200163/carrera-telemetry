import { Test, TestingModule } from '@nestjs/testing';
import { SessionResultsService } from 'src/session-result/session-result.service';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionsRepo } from './sessions.repo';
import { SessionRuntimeService } from './session-runtime.service';

describe('SessionRuntimeService', () => {
  let service: SessionRuntimeService;
  const sessionsRepo = {
    findById: jest.fn(),
    finishSession: jest.fn(),
  };
  const sessionResultsService = {
    calculateSessionResults: jest.fn(),
  };
  const mqtt = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRuntimeService,
        { provide: SessionsRepo, useValue: sessionsRepo },
        { provide: SessionResultsService, useValue: sessionResultsService },
        { provide: MqttService, useValue: mqtt },
      ],
    }).compile();

    service = module.get(SessionRuntimeService);
    jest.clearAllMocks();
  });

  it('skips start when session is missing', async () => {
    sessionsRepo.findById.mockResolvedValue(null);

    await service.onSessionStart(1);

    expect(mqtt.publish).not.toHaveBeenCalled();
    expect((service as any).runtimeBySession.has(1)).toBe(false);
  });

  it('stores runtime state and publishes start', async () => {
    const start = new Date('2024-01-01T00:00:00Z');
    sessionsRepo.findById.mockResolvedValue({
      id: 2,
      session_type: 'RACE',
      lap_limit: 10,
      time_limit_seconds: null,
      start_time: start,
    });

    await service.onSessionStart(2);

    expect(mqtt.publish).toHaveBeenCalledWith('race_control/sessions/start', {
      sessionId: 2,
    });
    expect((service as any).runtimeBySession.get(2)).toMatchObject({
      sessionId: 2,
      sessionType: 'RACE',
      lapLimit: 10,
      timeLimitSeconds: null,
      startedAt: start,
    });
  });

  it('ignores laps when no runtime state exists', async () => {
    await service.onLapPersisted(99, 1);
    expect(sessionsRepo.finishSession).not.toHaveBeenCalled();
  });

  it('finishes race when lap limit is reached', async () => {
    sessionsRepo.findById.mockResolvedValue({
      id: 3,
      session_type: 'RACE',
      lap_limit: 3,
      time_limit_seconds: null,
      start_time: new Date('2024-01-01T00:00:00Z'),
    });
    sessionsRepo.finishSession.mockResolvedValue({});
    sessionResultsService.calculateSessionResults.mockResolvedValue([]);
    mqtt.publish.mockResolvedValue(undefined);

    await service.onSessionStart(3);
    await service.onLapPersisted(3, 3);

    expect(sessionsRepo.finishSession).toHaveBeenCalledWith(3);
    expect(sessionResultsService.calculateSessionResults).toHaveBeenCalledWith(
      3,
    );
    expect(mqtt.publish).toHaveBeenCalledWith('race_control/sessions/stop', {
      sessionId: 3,
    });
    expect((service as any).runtimeBySession.has(3)).toBe(false);
  });

  it('finishes time-limited session when wall clock exceeds limit', async () => {
    const start = new Date('2024-01-01T00:00:00Z');
    sessionsRepo.findById.mockResolvedValue({
      id: 4,
      session_type: 'PRACTICE',
      lap_limit: null,
      time_limit_seconds: 5,
      start_time: start,
    });
    sessionsRepo.finishSession.mockResolvedValue({});
    sessionResultsService.calculateSessionResults.mockResolvedValue([]);
    mqtt.publish.mockResolvedValue(undefined);
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(start.getTime() + 6_000);

    await service.onSessionStart(4);
    await service.onLapPersisted(4, 1);

    expect(sessionsRepo.finishSession).toHaveBeenCalledWith(4);
    expect((service as any).runtimeBySession.has(4)).toBe(false);
    nowSpy.mockRestore();
  });

  it('finishSession persists results, publishes stop, and clears state', async () => {
    sessionResultsService.calculateSessionResults.mockResolvedValue([
      { driver_id: 1 },
    ]);
    sessionsRepo.finishSession.mockResolvedValue({});
    mqtt.publish.mockResolvedValue(undefined);
    (service as any).runtimeBySession.set(5, {
      sessionId: 5,
      sessionType: 'RACE',
      lapLimit: 1,
      timeLimitSeconds: null,
      startedAt: new Date(),
    });

    await service.finishSession(5);

    expect(sessionsRepo.finishSession).toHaveBeenCalledWith(5);
    expect(sessionResultsService.calculateSessionResults).toHaveBeenCalledWith(
      5,
    );
    expect(mqtt.publish).toHaveBeenCalledWith('race_control/sessions/stop', {
      sessionId: 5,
    });
    expect((service as any).runtimeBySession.has(5)).toBe(false);
  });
});
