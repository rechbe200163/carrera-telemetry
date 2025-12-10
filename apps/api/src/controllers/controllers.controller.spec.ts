import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ControllersController } from './controllers.controller';
import { ControllersService } from './controllers.service';

describe('ControllersController (HTTP)', () => {
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
      controllers: [ControllersController],
      providers: [{ provide: ControllersService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /controllers creates a controller', async () => {
    const dto = { address: 'abc' };
    const created = { id: 1, ...dto };
    service.create.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/controllers')
      .send(dto)
      .expect(201)
      .expect(created);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('GET /controllers returns all controllers', async () => {
    const controllers = [{ id: 2 }];
    service.findAll.mockResolvedValue(controllers);

    await request(app.getHttpServer()).get('/controllers').expect(200).expect(controllers);

    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /controllers/:id fetches a controller by id', async () => {
    const controller = { id: 5 };
    service.findOne.mockResolvedValue(controller);

    await request(app.getHttpServer()).get('/controllers/5').expect(200).expect(controller);

    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('PATCH /controllers/:id updates a controller', async () => {
    const dto = { address: 'updated' };
    const updated = { id: 3, ...dto };
    service.update.mockResolvedValue(updated);

    await request(app.getHttpServer()).patch('/controllers/3').send(dto).expect(200).expect(updated);

    expect(service.update).toHaveBeenCalledWith(3, dto);
  });

  it('DELETE /controllers/:id removes a controller', async () => {
    service.remove.mockResolvedValue('removed');

    await request(app.getHttpServer()).delete('/controllers/6').expect(200).expect('removed');

    expect(service.remove).toHaveBeenCalledWith(6);
  });
});
