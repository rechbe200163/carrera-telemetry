import { LapEventsConsumer } from './lap-events.consumer';
import { LapsRepo } from 'src/laps/laps.repo';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionRuntimeService } from 'src/sessions/session-runtime.service';
import { SessionsRepo } from 'src/sessions/sessions.repo';

describe('LapEventsConsumer', () => {
  const subscribe = jest.fn();
  const mqtt: Partial<MqttService> = { subscribe };
  const sessionsRepo = { listEntriesForSession: jest.fn() };
  const lapsRepo = { create: jest.fn() };
  const sessionRuntime = { onLapPersisted: jest.fn() };
  let consumer: LapEventsConsumer;

  const getHandler = (topic: string) =>
    subscribe.mock.calls.find((c) => c[0] === topic)?.[1] as
      | ((payload: any) => Promise<void> | void)
      | undefined;

  beforeEach(() => {
    subscribe.mockReset();
    sessionsRepo.listEntriesForSession.mockReset();
    lapsRepo.create.mockReset();
    sessionRuntime.onLapPersisted.mockReset();
    consumer = new LapEventsConsumer(
      mqtt as MqttService,
      sessionsRepo as any,
      lapsRepo as any,
      sessionRuntime as any,
    );
    consumer.onModuleInit();
  });

  it('subscribes to all expected topics on init', () => {
    expect(subscribe).toHaveBeenCalledTimes(3);
    expect(getHandler('carrera/cu/lapTimes')).toBeDefined();
    expect(getHandler('race_control/sessions/start')).toBeDefined();
    expect(getHandler('race_control/sessions/stop')).toBeDefined();
  });

  it('maps controllers on session start and persists laps with runtime callback', async () => {
    sessionsRepo.listEntriesForSession.mockResolvedValue({
      session_entries: [
        { controller_address: 10, driver_id: 7 },
      ],
    });

    await getHandler('race_control/sessions/start')?.({ sessionId: 1 });

    const lapHandler = getHandler('carrera/cu/lapTimes')!;
    const payload = {
      controllerAddress: 10,
      lapNumber: 3,
      wallClockTs: 1_700_000_000_000,
      lapTimeMs: 900,
      sectorTimes: { s1: 1, s2: 2 },
    };

    await lapHandler(payload);

    expect(lapsRepo.create).toHaveBeenCalledWith({
      session_id: 1,
      driver_id: 7,
      lap_number: 3,
      date_start: new Date(payload.wallClockTs),
      lap_duration_ms: 900,
      duration_sector1: 1,
      duration_sector2: 2,
      duration_sector3: null,
      is_pit_out_lap: false,
      is_valid: true,
    });
    expect(sessionRuntime.onLapPersisted).toHaveBeenCalledWith(1, 3);
  });

  it('ignores lap events when no active session or mapping exists', async () => {
    const lapHandler = getHandler('carrera/cu/lapTimes')!;
    await lapHandler({ controllerAddress: 999 });

    expect(lapsRepo.create).not.toHaveBeenCalled();

    await getHandler('race_control/sessions/start')?.({ sessionId: 2 });
    sessionsRepo.listEntriesForSession.mockResolvedValue({ session_entries: [] });
    // rebuild mapping with empty entries
    await getHandler('race_control/sessions/start')?.({ sessionId: 2 });
    await lapHandler({ controllerAddress: 1 });
    expect(lapsRepo.create).not.toHaveBeenCalled();
  });

  it('clears active session and controller map on stop', async () => {
    sessionsRepo.listEntriesForSession.mockResolvedValue({
      session_entries: [{ controller_address: 1, driver_id: 2 }],
    });
    await getHandler('race_control/sessions/start')?.({ sessionId: 3 });
    expect((consumer as any).activeSessionId).toBe(3);

    await getHandler('race_control/sessions/stop')?.({ sessionId: 3 });

    expect((consumer as any).activeSessionId).toBeNull();
    expect((consumer as any).controllerMap.size).toBe(0);
  });
});
