import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateLapDto } from './dto/create-lap.dto';
import { Lap } from './entities/lap.entity';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class LapsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLapDto): Promise<Lap> {
    return this.prisma.laps.create({ data });
  }

  async createMany(data: CreateLapDto[]) {
    if (!data.length) return { count: 0 };
    return this.prisma.laps.createMany({ data });
  }

  async findBySession<
    TSelect extends Prisma.lapsSelect | undefined = undefined,
  >(
    sessionId: number,
    select?: TSelect,
  ): Promise<
    TSelect extends undefined
      ? Lap[]
      : Prisma.lapsGetPayload<{ select: TSelect }>[]
  > {
    return this.prisma.laps.findMany({
      where: { session_id: sessionId },
      orderBy: [{ lap_number: 'asc' }],
      ...(select ? { select } : {}),
    }) as any;
  }

  async findBySessionAndDriver(sessionId: number, driverId: number) {
    const data = await this.prisma.laps.findMany({
      where: {
        session_id: sessionId,
        driver_id: driverId,
      },
      orderBy: [{ lap_number: 'asc' }],
    });
    if (!data || data.length === 0)
      throw new NotFoundException('Dataset for criteria not found');
    return data;
  }

  async findLatestForSession(sessionId: number): Promise<Lap | null> {
    return this.prisma.laps.findFirst({
      where: { session_id: sessionId },
      orderBy: [{ lap_number: 'desc' }],
    });
  }
}
