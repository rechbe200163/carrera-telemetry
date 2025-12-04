import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCarDto } from 'src/cars/dto/create-car.dto';

@Injectable()
export class LapTimesRepository {
  constructor(
    @Inject('PrismaService')
    private prismaClient: CustomPrismaService<PrismaClient>,
  ) {}

  async create(data: CreateCarDto) {
    return this.prismaClient.client.cars.create({
      data,
    });
  }
}
