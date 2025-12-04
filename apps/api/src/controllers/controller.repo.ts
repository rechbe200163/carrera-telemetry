import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';

@Injectable()
export class ControllersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateControllerDto) {
    return this.prisma.controllers.create({ data });
  }

  async findAll() {
    return this.prisma.controllers.findMany();
  }

  async findById(id: number) {
    return this.prisma.controllers.findUnique({ where: { id } });
  }

  async findByAddress(address: number) {
    return this.prisma.controllers.findUnique({ where: { address } });
  }

  async update(id: number, data: UpdateControllerDto) {
    return this.prisma.controllers.update({
      where: { id },
      data,
    });
  }
}
