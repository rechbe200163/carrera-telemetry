import { Test, TestingModule } from '@nestjs/testing';
import { LiveSessionsController } from './live.controller';
import { SessionRuntimeService } from 'src/sessions/session-runtime.service';

describe('LiveController', () => {
  let controller: LiveSessionsController;
  const runtime = { streamSession: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveSessionsController],
      providers: [
        { provide: SessionRuntimeService, useValue: runtime },
      ],
    }).compile();

    controller = module.get<LiveSessionsController>(LiveSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
