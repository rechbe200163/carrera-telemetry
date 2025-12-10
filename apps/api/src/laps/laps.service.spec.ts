import { Test, TestingModule } from '@nestjs/testing';
import { LapsRepo } from './laps.repo';
import { LapsService } from './laps.service';

describe('LapsService', () => {
  let service: LapsService;
  const repo = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LapsService,
        { provide: LapsRepo, useValue: repo },
      ],
    }).compile();

    service = module.get(LapsService);
    jest.clearAllMocks();
  });

  it('persists a lap from event and emits it on the stream', async () => {
    const lap = { id: 1, session_id: 2 };
    repo.create.mockResolvedValue(lap);
    const events: any[] = [];
    (service as any).lapStream$.subscribe((evt: any) => events.push(evt));

    const dto = {
      session_id: 2,
      driver_id: 3,
      lap_number: 4,
      date_start: new Date(),
      lap_duration_ms: 1234,
      duration_sector1: null,
      duration_sector2: null,
      duration_sector3: null,
      is_pit_out_lap: false,
      is_valid: true,
    };

    const res = await service.createFromEvent(dto as any);

    expect(res).toBe(lap);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(events).toHaveLength(1);
    expect(events[0].data).toEqual({ type: 'lap', lap });
  });
});
