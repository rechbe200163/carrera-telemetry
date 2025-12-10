import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { SessionEntriesController } from './session-entry.controller';
import { SessionEntriesService } from './session-entry.service';

describe('SessionEntriesController (HTTP)', () => {
  let app: INestApplication;
  let service: { assignDriverToController: jest.Mock; listEntries: jest.Mock };

  beforeEach(async () => {
    service = {
      assignDriverToController: jest.fn(),
      listEntries: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionEntriesController],
      providers: [{ provide: SessionEntriesService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /sessions/:sessionId/entries should pass session id and body to the service', async () => {
    const dto = { controller_address: 'A1', driver_id: 5 };
    const created = { id: 10, ...dto, session_id: 7 };
    service.assignDriverToController.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/sessions/7/entries')
      .send(dto)
      .expect(201)
      .expect(created);

    expect(service.assignDriverToController).toHaveBeenCalledWith(7, dto);
  });

  it('GET /sessions/:sessionId/entries should list entries for the session', async () => {
    const entries = [{ id: 1 }];
    service.listEntries.mockResolvedValue(entries);

    await request(app.getHttpServer())
      .get('/sessions/4/entries')
      .expect(200)
      .expect(entries);

    expect(service.listEntries).toHaveBeenCalledWith(4);
  });
});
