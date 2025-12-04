import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDriverDto, code: string) {
    return this.prisma.drivers.create({
      data: {
        ...data,
        code,
      },
    });
  }

  async findAll() {
    return this.prisma.drivers.findMany();
  }

  async findById(id: number): Promise<Driver | null> {
    return this.prisma.drivers.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<Driver | null> {
    return this.prisma.drivers.findUnique({
      where: { code },
    });
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.drivers.count({
      where: { code },
    });
    return count > 0;
  }

  async update(id: number, data: UpdateDriverDto) {
    return this.prisma.drivers.update({
      where: { id },
      data,
    });
  }
}
