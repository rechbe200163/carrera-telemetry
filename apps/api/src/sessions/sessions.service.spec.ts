import {
  BadRequestException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SessionRuntimeService } from './session-runtime.service';
import { SessionsRepo } from './sessions.repo';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;
  const repo = {
    findById: jest.fn(),
    startSession: jest.fn(),
    findByMeetingId: jest.fn(),
    findAll: jest.fn(),
  };
  const mqtt = { publish: jest.fn() };
  const runtime = { onSessionStart: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: SessionsRepo, useValue: repo },
        { provide: MqttService, useValue: mqtt },
        { provide: SessionRuntimeService, useValue: runtime },
      ],
    }).compile();

    service = module.get(SessionsService);
    jest.clearAllMocks();
  });

  it('throws when session does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.startSession(1, {} as any)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('validates duration for practice/quali', async () => {
    repo.findById.mockResolvedValue({ id: 1, session_type: 'PRACTICE' });

    await expect(service.startSession(1, {} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('starts practice/quali with time limit and triggers runtime', async () => {
    repo.findById.mockResolvedValue({
      id: 1,
      session_type: 'QUALYFING',
    });
    repo.startSession.mockResolvedValue({});

    await service.startSession(1, { durationMinutes: 10 } as any);

    expect(repo.startSession).toHaveBeenCalledWith(1, {
      time_limit_seconds: 600,
      lap_limit: null,
    });
    expect(runtime.onSessionStart).toHaveBeenCalledWith(1);
  });

  it('validates lap limit for race', async () => {
    repo.findById.mockResolvedValue({ id: 2, session_type: 'RACE' });

    await expect(service.startSession(2, {} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('starts race with lap limit', async () => {
    repo.findById.mockResolvedValue({ id: 2, session_type: 'RACE' });

    await service.startSession(2, { lapLimit: 50 } as any);

    expect(repo.startSession).toHaveBeenCalledWith(2, {
      time_limit_seconds: null,
      lap_limit: 50,
    });
    expect(runtime.onSessionStart).toHaveBeenCalledWith(2);
  });

  it('throws for FUN sessions', async () => {
    repo.findById.mockResolvedValue({ id: 3, session_type: 'FUN' });

    await expect(
      service.startSession(3, { durationMinutes: 5 } as any),
    ).rejects.toBeInstanceOf(NotImplementedException);
  });

  it('throws for unknown session types', async () => {
    repo.findById.mockResolvedValue({ id: 4, session_type: 'UNKNOWN' });

    await expect(
      service.startSession(4, { durationMinutes: 5 } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
