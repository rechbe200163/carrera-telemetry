import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { CreateCarDto } from './dto/create-car.dto';
import { CustomPrismaService } from 'nestjs-prisma';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<PrismaClient>, //
  ) {}

  async create(data: CreateCarDto) {
    return this.prisma.client.cars.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.client.cars.findMany();
  }

  async findOne(id: number) {
    return this.prisma.client.cars.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateCarDto) {
    return this.prisma.client.cars.update({
      where: { id },
      data,
    });
  }
}
