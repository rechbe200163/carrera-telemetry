import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { of } from 'rxjs';
import { LapsController } from './laps.controller';
import { LapsService } from './laps.service';
import { MqttService } from 'src/mqtt/mqtt.service';

describe('LapsController (HTTP)', () => {
  let app: INestApplication;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let mqttService: { lapEvents$: jest.Mock };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    mqttService = {
      lapEvents$: jest.fn().mockReturnValue(of()),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LapsController],
      providers: [
        { provide: LapsService, useValue: service },
        { provide: MqttService, useValue: mqttService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /laps should create a lap', async () => {
    const dto = { session_id: 1, lap_time: 120 };
    const created = { id: 9, ...dto };
    service.create.mockResolvedValue(created);

    await request(app.getHttpServer()).post('/laps').send(dto).expect(201).expect(created);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('GET /laps should return all laps', async () => {
    const laps = [{ id: 1 }];
    service.findAll.mockResolvedValue(laps);

    await request(app.getHttpServer()).get('/laps').expect(200).expect(laps);

    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /laps/:id should parse id and return lap', async () => {
    const lap = { id: 3 };
    service.findOne.mockResolvedValue(lap);

    await request(app.getHttpServer()).get('/laps/3').expect(200).expect(lap);

    expect(service.findOne).toHaveBeenCalledWith(3);
  });

  it('PATCH /laps/:id should update lap with id and payload', async () => {
    const dto = { lap_time: 118 };
    const updated = { id: 4, ...dto };
    service.update.mockResolvedValue(updated);

    await request(app.getHttpServer()).patch('/laps/4').send(dto).expect(200).expect(updated);

    expect(service.update).toHaveBeenCalledWith(4, dto);
  });

  it('DELETE /laps/:id should remove lap by id', async () => {
    service.remove.mockResolvedValue('removed');

    await request(app.getHttpServer()).delete('/laps/5').expect(200).expect('removed');

    expect(service.remove).toHaveBeenCalledWith(5);
  });
});
