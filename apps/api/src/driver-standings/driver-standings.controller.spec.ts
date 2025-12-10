import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DriverStandingsController } from './driver-standings.controller';
import { DriverStandingsService } from './driver-standings.service';

describe('DriverStandingsController (HTTP)', () => {
  let app: INestApplication;
  let service: { getLeaderBoard: jest.Mock };

  beforeEach(async () => {
    service = {
      getLeaderBoard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverStandingsController],
      providers: [{ provide: DriverStandingsService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /driver-standings/championship/:id/leaderBoard returns leader board for the championship', async () => {
    const leaderboard = [{ driver: { id: 1 }, championship: { points_total: 25, position: 1 } }];
    service.getLeaderBoard.mockResolvedValue(leaderboard);

    await request(app.getHttpServer())
      .get('/driver-standings/championship/2/leaderBoard')
      .expect(200)
      .expect(leaderboard);

    expect(service.getLeaderBoard).toHaveBeenCalledWith(2);
  });
});
