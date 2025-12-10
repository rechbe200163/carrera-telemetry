import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ChampionshipsController } from './championships.controller';
import { ChampionshipsService } from './championships.service';

describe('ChampionshipsController (HTTP)', () => {
  let app: INestApplication;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByMettingId: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByMettingId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChampionshipsController],
      providers: [{ provide: ChampionshipsService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /championships should delegate creation to the service', async () => {
    const dto = { name: 'Winter Cup' };
    const created = { id: 1, ...dto };
    service.create.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/championships')
      .send(dto)
      .expect(201)
      .expect(created);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('GET /championships should return all championships', async () => {
    const list = [{ id: 1 }, { id: 2 }];
    service.findAll.mockResolvedValue(list);

    await request(app.getHttpServer())
      .get('/championships')
      .expect(200)
      .expect(list);

    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /championships/:id should parse the id and fetch the championship', async () => {
    const championship = { id: 5, name: 'Series' };
    service.findOne.mockResolvedValue(championship);

    await request(app.getHttpServer())
      .get('/championships/5')
      .expect(200)
      .expect(championship);

    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('GET /championships/meeting/:id should forward meeting id to the service', async () => {
    const data = { id: 3, name: 'Round 1' };
    service.findByMettingId.mockResolvedValue(data);

    await request(app.getHttpServer())
      .get('/championships/meeting/3')
      .expect(200)
      .expect(data);

    expect(service.findByMettingId).toHaveBeenCalledWith(3);
  });

  it('PATCH /championships/:id should pass the payload and id to the service', async () => {
    const updateDto = { name: 'Updated' };
    const updated = { id: 7, ...updateDto };
    service.update.mockResolvedValue(updated);

    await request(app.getHttpServer())
      .patch('/championships/7')
      .send(updateDto)
      .expect(200)
      .expect(updated);

    expect(service.update).toHaveBeenCalledWith(7, updateDto);
  });

  it('DELETE /championships/:id should call remove with numeric id', async () => {
    service.remove.mockResolvedValue('deleted');

    await request(app.getHttpServer())
      .delete('/championships/9')
      .expect(200)
      .expect('deleted');

    expect(service.remove).toHaveBeenCalledWith(9);
  });
});
