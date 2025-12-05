import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SessionEntry } from './dto/create-session-entry.dto';
import { CreateSessionEntryDto } from './entities/session-entry.entity';

@Injectable()
export class SessionEntriesRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionEntryDto): Promise<SessionEntry> {
    return this.prisma.session_entries.create({ data });
  }

  async listEntriesForSession(sessionId: number): Promise<SessionEntry[]> {
    const entries = await this.prisma.session_entries.findMany({
      where: { session_id: sessionId },
      orderBy: [{ controller_address: 'asc' }],
    });
    return entries;
  }

  async findBySessionAndController(
    sessionId: number,
    controllerAddress: number,
  ): Promise<SessionEntry | null> {
    return this.prisma.session_entries.findUnique({
      where: {
        // nutzt dein UNIQUE-Index (session_id, controller_address)
        session_id_controller_address: {
          session_id: sessionId,
          controller_address: controllerAddress,
        },
      },
    });
  }

  async findBySessionAndDriver(
    sessionId: number,
    driverId: number,
  ): Promise<SessionEntry | null> {
    return this.prisma.session_entries.findUnique({
      where: {
        // nutzt dein UNIQUE-Index (session_id, driver_id)
        session_id_driver_id: {
          session_id: sessionId,
          driver_id: driverId,
        },
      },
    });
  }

  async deleteBySession(sessionId: number): Promise<{ count: number }> {
    return this.prisma.session_entries.deleteMany({
      where: { session_id: sessionId },
    });
  }
}
