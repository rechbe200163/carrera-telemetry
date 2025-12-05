import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSessionResultDto } from './dto/create-session-result.dto';
import { SessionResult } from './entities/session-result.entity';

@Injectable()
export class SessionResultsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionResultDto): Promise<SessionResult> {
    return this.prisma.session_results.create({ data });
  }

  async upsertForSessionAndDriver(
    sessionId: number,
    driverId: number,
    data: Omit<CreateSessionResultDto, 'session_id' | 'driver_id'>,
  ): Promise<SessionResult> {
    return this.prisma.session_results.upsert({
      where: {
        // nutzt dein UNIQUE (session_id, driver_id)
        session_id_driver_id: { session_id: sessionId, driver_id: driverId },
      },
      create: {
        session_id: sessionId,
        driver_id: driverId,
        ...data,
      },
      update: {
        ...data,
      },
    });
  }

  async findBySession(sessionId: number): Promise<SessionResult[]> {
    return this.prisma.session_results.findMany({
      where: { session_id: sessionId },
      orderBy: [{ position: 'asc' }],
    });
  }

  async deleteBySession(sessionId: number): Promise<{ count: number }> {
    return this.prisma.session_results.deleteMany({
      where: { session_id: sessionId },
    });
  }
}
