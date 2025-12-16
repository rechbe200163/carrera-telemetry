import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SESSION_STARTED_EVENT } from 'src/events/events';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionsRepo } from './sessions.repo';
import { SessionLifecycleService } from './session-lifecycle.service';
import { SessionRuntimeService } from './session-runtime.service';

describe('SessionRuntimeService', () => {
  let service: SessionRuntimeService;
  const sessionsRepo = { findById: jest.fn() };
  const mqtt = { publish: jest.fn() };
  const eventEmitter = { emit: jest.fn() } as unknown as EventEmitter2;
  const lifecycle = { finishSession: jest.fn() } as unknown as SessionLifecycleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRuntimeService,
        { provide: SessionsRepo, useValue: sessionsRepo },
        { provide: MqttService, useValue: mqtt },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: SessionLifecycleService, useValue: lifecycle },
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

  it('stores runtime state, emits start event and publishes start topic', async () => {
    const start = new Date('2024-01-01T00:00:00Z');
    sessionsRepo.findById.mockResolvedValue({
      id: 2,
      meeting_id: 3,
      session_type: 'RACE',
      lap_limit: 10,
      time_limit_seconds: null,
      start_time: start,
    });

    await service.onSessionStart(2);

    expect(eventEmitter.emit).toHaveBeenCalledWith(SESSION_STARTED_EVENT, {
      sessionId: 2,
      meetingId: 3,
      sessionType: 'RACE',
      lapLimit: 10,
      timeLimitSeconds: null,
      startedAt: start,
    });
    expect(mqtt.publish).toHaveBeenCalledWith('race_control/sessions/start', {
      sessionId: 2,
    });
    expect((service as any).runtimeBySession.get(2)).toMatchObject({
      sessionId: 2,
      meetingId: 3,
    });
  });

  it('ignores laps when no runtime state exists', async () => {
    await service.onLapPersisted({
      sessionId: 99,
      driverId: 1,
      controllerAddress: 1,
      lapNumber: 1,
      lapTimeMs: 100,
    });
    expect(lifecycle.finishSession).not.toHaveBeenCalled();
  });

  it('signals lifecycle when lap limit is reached', async () => {
    const start = new Date('2024-01-01T00:00:00Z');
    sessionsRepo.findById.mockResolvedValue({
      id: 3,
      meeting_id: 4,
      session_type: 'RACE',
      lap_limit: 1,
      time_limit_seconds: null,
      start_time: start,
    });

    await service.onSessionStart(3);
    await service.onLapPersisted({
      sessionId: 3,
      driverId: 7,
      controllerAddress: 9,
      lapNumber: 1,
      lapTimeMs: 800,
    });

    expect(lifecycle.finishSession).toHaveBeenCalledWith(3);
  });

  it('signals lifecycle when time limit is exceeded', async () => {
    const start = new Date('2024-01-01T00:00:00Z');
    sessionsRepo.findById.mockResolvedValue({
      id: 4,
      meeting_id: 5,
      session_type: 'PRACTICE',
      lap_limit: null,
      time_limit_seconds: 5,
      start_time: start,
    });
    jest.spyOn(Date, 'now').mockReturnValue(start.getTime() + 6000);

    await service.onSessionStart(4);
    await service.onLapPersisted({
      sessionId: 4,
      driverId: 1,
      controllerAddress: 2,
      lapNumber: 1,
      lapTimeMs: 900,
    });

    expect(lifecycle.finishSession).toHaveBeenCalledWith(4);
    (Date.now as jest.Mock).mockRestore();
  });

  it('cleans up state and completes SSE subject on cleanup', async () => {
    const snapDriver = {
      driverId: 1,
      controllerAddress: 1,
      lapsCompleted: 0,
      currentLap: 1,
      lastLapMs: null,
      bestLapMs: null,
      sector1Ms: null,
      sector2Ms: null,
      totalTimeMs: 0,
      gapToLeaderMs: null,
    };

    (service as any).runtimeBySession.set(5, {
      sessionId: 5,
      meetingId: 1,
      sessionType: 'RACE',
      lapLimit: 1,
      timeLimitSeconds: null,
      startedAt: new Date(),
    });
    (service as any).driversBySession.set(5, new Map([[1, snapDriver]]));
    const subject = (service as any).ensureSubject(5);

    const received: any[] = [];
    let completed = false;
    subject.subscribe({
      next: (v: any) => received.push(v),
      complete: () => {
        completed = true;
      },
    });

    const fakeInterval = setInterval(() => undefined, 1000);
    (service as any).tickersBySession.set(5, fakeInterval);

    await service.cleanup(5);

    expect(completed).toBe(true);
    expect(received[0].sessionId).toBe(5);
    expect((service as any).runtimeBySession.has(5)).toBe(false);
    expect((service as any).driversBySession.has(5)).toBe(false);
    expect((service as any).tickersBySession.has(5)).toBe(false);
  });
});
