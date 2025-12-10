import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

describe('DriversController (HTTP)', () => {
  let app: INestApplication;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriversController],
      providers: [{ provide: DriversService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /drivers should create a driver via the service', async () => {
    const dto = { first_name: 'Max', last_name: 'Speed' };
    const created = { id: 1, ...dto };
    service.create.mockResolvedValue(created);

    await request(app.getHttpServer()).post('/drivers').send(dto).expect(201).expect(created);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('GET /drivers should fetch all drivers', async () => {
    const drivers = [{ id: 1 }];
    service.findAll.mockResolvedValue(drivers);

    await request(app.getHttpServer()).get('/drivers').expect(200).expect(drivers);

    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /drivers/:id should parse id and fetch a driver', async () => {
    const driver = { id: 4 };
    service.findOne.mockResolvedValue(driver);

    await request(app.getHttpServer()).get('/drivers/4').expect(200).expect(driver);

    expect(service.findOne).toHaveBeenCalledWith(4);
  });

  it('PATCH /drivers/:id should update a driver', async () => {
    const dto = { first_name: 'New' };
    const updated = { id: 2, ...dto };
    service.update.mockResolvedValue(updated);

    await request(app.getHttpServer()).patch('/drivers/2').send(dto).expect(200).expect(updated);

    expect(service.update).toHaveBeenCalledWith(2, dto);
  });

  it('DELETE /drivers/:id should remove a driver', async () => {
    service.remove.mockResolvedValue('removed');

    await request(app.getHttpServer()).delete('/drivers/9').expect(200).expect('removed');

    expect(service.remove).toHaveBeenCalledWith(9);
  });
});
