import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';

describe('MeetingsController (HTTP)', () => {
  let app: INestApplication;
  let service: {
    createNextMeeting: jest.Mock;
    getAll: jest.Mock;
    getMeeting: jest.Mock;
    listMeetingsByChampionship: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      createNextMeeting: jest.fn(),
      getAll: jest.fn(),
      getMeeting: jest.fn(),
      listMeetingsByChampionship: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [{ provide: MeetingsService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /meetings/gen-next/championship/:id/meetings creates the next meeting', async () => {
    const dto = { name: 'Round 2', track: 'Silverstone' };
    const created = { id: 11, ...dto, championship_id: 4 };
    service.createNextMeeting.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/meetings/gen-next/championship/4/meetings')
      .send(dto)
      .expect(201)
      .expect(created);

    expect(service.createNextMeeting).toHaveBeenCalledWith(4, dto);
  });

  it('GET /meetings returns the full list', async () => {
    const meetings = [{ id: 1 }, { id: 2 }];
    service.getAll.mockResolvedValue(meetings);

    await request(app.getHttpServer()).get('/meetings').expect(200).expect(meetings);

    expect(service.getAll).toHaveBeenCalledTimes(1);
  });

  it('GET /meetings/:id fetches a single meeting by id', async () => {
    const meeting = { id: 3, name: 'Race Day' };
    service.getMeeting.mockResolvedValue(meeting);

    await request(app.getHttpServer()).get('/meetings/3').expect(200).expect(meeting);

    expect(service.getMeeting).toHaveBeenCalledWith(3);
  });

  it('GET /meetings/championships/:id/meetings lists meetings for a championship', async () => {
    const meetings = [{ id: 8 }];
    service.listMeetingsByChampionship.mockResolvedValue(meetings);

    await request(app.getHttpServer())
      .get('/meetings/championships/6/meetings')
      .expect(200)
      .expect(meetings);

    expect(service.listMeetingsByChampionship).toHaveBeenCalledWith(6);
  });
});
