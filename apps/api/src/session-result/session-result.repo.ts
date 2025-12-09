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

  async createSessionResultsForSessionAndDriver(
    data: CreateSessionResultDto[],
  ) {
    const res = await this.prisma.session_results.createMany({
      data,
    });
    if (!res) {
      throw new Error('a error occurd');
    }
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
