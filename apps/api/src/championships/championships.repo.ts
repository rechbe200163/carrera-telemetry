import { PrismaService } from 'src/prisma.service';
import { ChampionShip } from './entities/champion-ship.entity';
import { Injectable } from '@nestjs/common';
import { CreateChampionshipDto } from './dto/create-champion-ship.dto';
import { UpdateChampionShipDto } from './dto/update-champion-ship.dto';
@Injectable()
export class ChampionshipsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateChampionshipDto): Promise<ChampionShip> {
    return this.prisma.championships.create({
      data,
    });
  }

  async findOneById(id: number): Promise<ChampionShip | null> {
    return this.prisma.championships.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<ChampionShip[]> {
    return this.prisma.championships.findMany();
  }

  async update(id: number, data: UpdateChampionShipDto): Promise<ChampionShip> {
    return this.prisma.championships.update({
      where: { id },
      data,
    });
  }

  async findByMettingId(meetingId: number) {
    return this.prisma.championships.findFirst({
      where: {
        meetings: {
          some: {
            id: meetingId,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<ChampionShip> {
    return this.prisma.championships.delete({
      where: { id },
    });
  }
}
