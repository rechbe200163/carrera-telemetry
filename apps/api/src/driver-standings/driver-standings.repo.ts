import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DriverStandingsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderBoard(championshipId: number) {
    return this.prisma.driver_standings.findMany({
      where: { championship_id: championshipId },
      include: {
        drivers: {
          select: {
            code: true,
            id: true,
            color: true,
          },
        },
      },
      orderBy: {
        points_total: 'desc',
      },
    });
  }
}
