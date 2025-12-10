import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DriversRepo } from './drivers.repo';
import { DriversService } from './drivers.service';

describe('DriversService', () => {
  let service: DriversService;
  const repo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    existsByCode: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        {
          provide: DriversRepo,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get(DriversService);
    jest.clearAllMocks();
  });

  it('creates a driver with the first free candidate code', async () => {
    repo.existsByCode.mockResolvedValueOnce(false);
    repo.findByCode.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 1, code: 'MAX' });

    const dto = { first_name: 'Max', last_name: 'Verstappen' };
    const result = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith(dto, 'MAX');
    expect(result).toEqual({ id: 1, code: 'MAX' });
  });

  it('tries alternative code candidates if earlier ones are taken', async () => {
    repo.existsByCode
      .mockResolvedValueOnce(true) // MAX already taken
      .mockResolvedValueOnce(false); // VMA free
    repo.findByCode.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 1, code: 'VMA' });

    const dto = { first_name: 'Max', last_name: 'Verstappen' };
    await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith(dto, 'VMA');
  });

  it('throws when a generated code already exists in DB', async () => {
    repo.existsByCode.mockResolvedValue(false);
    repo.findByCode.mockResolvedValue({ id: 9, code: 'MAX' });

    await expect(
      service.create({ first_name: 'Max', last_name: 'Verstappen' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('throws if all code candidates are taken', async () => {
    repo.existsByCode.mockResolvedValue(true);

    await expect(
      service.create({ first_name: 'Ed', last_name: 'Bo' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
