import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

describe('SessionsController (HTTP)', () => {
  let app: INestApplication;
  let service: {
    startSession: jest.Mock;
    abortSession: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByMeetingId: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      startSession: jest.fn(),
      abortSession: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByMeetingId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [{ provide: SessionsService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /sessions/:id/start should forward the dto and numeric id', async () => {
    const dto = { durationMinutes: 15 };
    service.startSession.mockResolvedValue('started');

    await request(app.getHttpServer())
      .post('/sessions/12/start')
      .send(dto)
      .expect(201)
      .expect('started');

    expect(service.startSession).toHaveBeenCalledWith(12, dto);
  });

  it('POST /sessions/:id/abort should call abortSession with the parsed id', async () => {
    service.abortSession.mockResolvedValue('aborted');

    await request(app.getHttpServer())
      .post('/sessions/3/abort')
      .expect(201)
      .expect('aborted');

    expect(service.abortSession).toHaveBeenCalledWith(3);
  });

  it('GET /sessions returns all sessions', async () => {
    const sessions = [{ id: 1 }];
    service.findAll.mockResolvedValue(sessions);

    await request(app.getHttpServer()).get('/sessions').expect(200).expect(sessions);

    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /sessions/:id returns a single session', async () => {
    const session = { id: 4 };
    service.findOne.mockResolvedValue(session);

    await request(app.getHttpServer()).get('/sessions/4').expect(200).expect(session);

    expect(service.findOne).toHaveBeenCalledWith(4);
  });

  it('GET /sessions/meeting/:id should query by meeting id', async () => {
    const sessions = [{ id: 2, meeting_id: 9 }];
    service.findByMeetingId.mockResolvedValue(sessions);

    await request(app.getHttpServer())
      .get('/sessions/meeting/9')
      .expect(200)
      .expect(sessions);

    expect(service.findByMeetingId).toHaveBeenCalledWith(9);
  });
});
