import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionType, Stauts } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsRepo {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * Erstellt automatisch:
   * - PRACTICE
   * - QUALI
   * - RACE
   */
  async createDefaultSessionsForMeeting(meetingId: number) {
    return this.prisma.sessions.createMany({
      data: [
        {
          meeting_id: meetingId,
          session_type: SessionType.PRACTICE,
          name: 'Practice',
          status: Stauts.PLANNED,
        },
        {
          meeting_id: meetingId,
          session_type: SessionType.QUALYFING,
          name: 'Qualifying',
          status: Stauts.PLANNED,
        },
        {
          meeting_id: meetingId,
          session_type: SessionType.RACE,
          name: 'Race',
          status: Stauts.PLANNED,
        },
      ],
    });
  }

  async startSession(
    sessionId: number,
    limits: { time_limit_seconds: number | null; lap_limit: number | null },
  ) {
    const res = await this.prisma.sessions.updateMany({
      where: { id: sessionId, status: Stauts.PLANNED },
      data: { status: Stauts.LIVE, start_time: new Date(), ...limits },
    });

    if (res.count !== 1) throw new BadRequestException('Session not planned');
    return this.findById(sessionId);
  }

  async finishSession(sessionId: number) {
    const res = await this.prisma.sessions.updateMany({
      where: { id: sessionId, status: Stauts.LIVE },
      data: { status: Stauts.FINISHED, end_time: new Date() },
    });

    if (res.count !== 1) throw new BadRequestException('Session not live');
    return this.findById(sessionId);
  }

  async findById(sessionId: number): Promise<Session> {
    const session = await this.prisma.sessions.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Sesssion with id not found');
    return session;
  }

  async findAll() {
    return this.prisma.sessions.findMany({
      orderBy: {
        session_type: 'desc',
      },
    });
    // return this.prisma.sessions.groupBy({
    //   by: 'session_type',
    // });
  }

  async findByMeetingId(meetingId: number) {
    return this.prisma.sessions.findMany({
      where: {
        meeting_id: meetingId,
      },
    });
  }

  async getActiveSession() {
    return this.prisma.sessions.findFirst({
      where: { status: Stauts.LIVE },
      orderBy: { start_time: 'desc' },
      include: { meetings: true },
    });
  }

  async update(sessionId: number, data: UpdateSessionDto) {
    return this.prisma.sessions.update({
      where: { id: sessionId },
      data,
    });
  }

  async listEntriesForSession(sessionId: number): Promise<Session | null> {
    return this.prisma.sessions.findUnique({
      where: { id: sessionId },
      include: {
        session_entries: true,
      },
    });
  }

  async abortSession(sessionId: number) {
    return this.prisma.sessions.update({
      where: { id: sessionId },
      data: {
        status: Stauts.CANCELLED,
        end_time: new Date(),
      },
    });
  }
}
