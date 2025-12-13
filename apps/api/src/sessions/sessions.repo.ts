import { championships } from './../../generated/prisma/client';
import { Injectable } from '@nestjs/common';
import { Stauts } from 'generated/prisma/enums';
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
          session_type: 'PRACTICE',
          name: 'Practice',
          status: 'PLANNED',
        },
        {
          meeting_id: meetingId,
          session_type: 'QUALYFING',
          name: 'Qualifying',
          status: 'PLANNED',
        },
        {
          meeting_id: meetingId,
          session_type: 'RACE',
          name: 'Race',
          status: 'PLANNED',
        },
      ],
    });
  }

  async startSession(
    sessionId: number,
    limits: { time_limit_seconds: number | null; lap_limit: number | null },
  ) {
    return this.prisma.sessions.update({
      where: { id: sessionId },
      data: {
        status: 'LIVE',
        start_time: new Date(),
        ...limits,
      },
    });
  }

  async finishSession(sessionId: number) {
    return this.prisma.sessions.update({
      where: { id: sessionId },
      data: {
        status: 'FINISHED',
        end_time: new Date(),
      },
    });
  }

  async findById(sessionId: number) {
    return this.prisma.sessions.findUnique({
      where: { id: sessionId },
    });
  }

  async findAll() {
    return this.prisma.sessions.findMany({
      orderBy: {
        status: 'asc',
      },
    });
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
      where: { status: 'LIVE' },
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
        status: 'CANCELLED',
        end_time: new Date(),
      },
    });
  }
}
