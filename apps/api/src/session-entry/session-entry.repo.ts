import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSessionEntryDto } from './dto/create-session-entry.dto';

@Injectable()
export class SessionEntriesRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionEntryDto): Promise<CreateSessionEntryDto> {
    return this.prisma.session_entries.create({ data });
  }

  async listEntriesForSession(
    sessionId: number,
  ): Promise<CreateSessionEntryDto[]> {
    const entries = await this.prisma.session_entries.findMany({
      where: { session_id: sessionId },
      orderBy: [{ controller_address: 'asc' }],
    });
    return entries;
  }

  async findBySessionAndController(
    sessionId: number,
    controllerAddress: number,
  ): Promise<CreateSessionEntryDto | null> {
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
  ): Promise<CreateSessionEntryDto | null> {
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
