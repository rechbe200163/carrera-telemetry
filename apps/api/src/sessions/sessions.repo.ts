import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionType, Stauts } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';

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
          name: SessionType.PRACTICE.toLowerCase(),
          status: Stauts.PLANNED,
        },
        {
          meeting_id: meetingId,
          session_type: SessionType.QUALYFING,
          name: SessionType.QUALYFING.toLowerCase(),
          status: Stauts.PLANNED,
        },
        {
          meeting_id: meetingId,
          session_type: SessionType.RACE,
          name: SessionType.RACE.toLowerCase(),
          status: Stauts.PLANNED,
        },
      ],
    });
  }

  async createDefaultSessionsForFunMeeting(meetingId: number, amount: number) {
    const n = Math.max(1, Math.min(amount, 5)); // z.B. 50 als Hardcap
    const existing = await this.prisma.sessions.count({
      where: { meeting_id: meetingId, session_type: SessionType.FUN },
    });

    const data = Array.from({ length: n }, (_, i) => ({
      meeting_id: meetingId,
      session_type: SessionType.FUN, // oder SessionType.TEST wenn du umbenennst
      name: `Test ${existing + i + 1}`,
      status: Stauts.PLANNED,
    }));

    return this.prisma.sessions.createMany({
      data,
      // optional: skipDuplicates nur sinnvoll, wenn du unique constraints hast
      // skipDuplicates: true,
    });
  }

  createSingleSession(data: CreateSessionDto) {
    if (!data.meetingId)
      throw new BadRequestException(
        'meetingId is mandatory for this operation',
      );
    return this.prisma.sessions.create({
      data: {
        meeting_id: data.meetingId,
        session_type: data.sessionType,
        ...data,
      },
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
