import { CustomPrismaService } from 'nestjs-prisma';
import { Inject, Injectable } from '@nestjs/common';
import { CreateLapTimeDto } from './dto/create-lap-time.dto';
import { UpdateLapTimeDto } from './dto/update-lap-time.dto';
import { PrismaClient } from 'generated/prisma/client';
import { LapTimesRepository } from './lap-times.repository';

@Injectable()
export class LapTimesService {
  constructor(private readonly lapTimesRepository: LapTimesRepository) {}

  create(createLapTimeDto: CreateLapTimeDto) {
    return 'This action adds a new lapTime';
  }

  findAll() {
    return `This action returns all lapTimes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lapTime`;
  }

  update(id: number, updateLapTimeDto: UpdateLapTimeDto) {
    return `This action updates a #${id} lapTime`;
  }

  remove(id: number) {
    return `This action removes a #${id} lapTime`;
  }
}
