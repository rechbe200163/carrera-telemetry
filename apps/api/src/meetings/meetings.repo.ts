import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { Meetings } from './entities/meeting.entity';
import { SessionsRepo } from 'src/sessions/sessions.repo'; // <-- wichtig
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MeetingsRepo {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsRepo: SessionsRepo,
  ) {}

  async create(data: CreateMeetingDto): Promise<Meetings> {
    return this.prisma.meetings.create({
      data,
    });
  }

  /**
   * Erzeugt automatisch:
   * - Ein Meeting für eine Championship
   * - Round-Number automatisch → (#existingMeetings + 1)
   * - Practice, Qualifying, Race Sessions
   */
  async createMeetingWithDefaultSessions(
    championshipId: number,
    data: CreateMeetingDto,
  ) {
    // 1) Anzahl der bisherigen Meetings in dieser WM ermitteln
    const count = await this.prisma.meetings.count({
      where: { championship_id: championshipId },
    });

    const nextRound = count + 1;

    // 2) Meeting anlegen
    const meeting = await this.prisma.meetings.create({
      data: {
        championship_id: championshipId,
        round_number: nextRound,
        ...data,
      },
    });

    // 3) Default Sessions anlegen
    await this.sessionsRepo.createDefaultSessionsForMeeting(meeting.id);

    return meeting;
  }

  async getById(id: number) {
    return this.prisma.meetings.findUnique({
      where: { id },
    });
  }

  async listMeetingsByChampionship(championshipId: number) {
    return this.prisma.meetings.findMany({
      where: { championship_id: championshipId },
      orderBy: {
        round_number: 'asc',
      },
    });
  }

  async getAll() {
    return this.prisma.meetings.findMany();
  }

  async getMeeting(id: number): Promise<Meetings | null> {
    const meeting = await this.prisma.meetings.findUnique({
      where: { id },
    });

    if (!meeting)
      throw new NotFoundException('meeting with given id not found');

    return plainToInstance(Meetings, meeting, {
      excludeExtraneousValues: true,
    });
  }

  async recomputeMeetingStatus(meetingId: number): Promise<{
    meetingId: number;
    championshipId: number | null;
    changedToFinished: boolean;
  }> {
    return this.prisma.$transaction(async (tx) => {
      const meeting = await tx.meetings.findUnique({
        where: { id: meetingId },
        select: { id: true, status: true, championship_id: true },
      });

      if (!meeting) {
        return { meetingId, championshipId: null, changedToFinished: false };
      }

      const totalSessions = await tx.sessions.count({
        where: { meeting_id: meetingId },
      });

      if (totalSessions === 0) {
        return {
          meetingId,
          championshipId: meeting.championship_id ?? null,
          changedToFinished: false,
        };
      }

      const finishedSessions = await tx.sessions.count({
        where: { meeting_id: meetingId, status: 'FINISHED' },
      });

      const shouldBeFinished = finishedSessions === totalSessions;

      // Idempotenz: wenn schon finished, nix tun
      if (meeting.status === 'FINISHED') {
        return {
          meetingId,
          championshipId: meeting.championship_id ?? null,
          changedToFinished: false,
        };
      }

      if (!shouldBeFinished) {
        return {
          meetingId,
          championshipId: meeting.championship_id ?? null,
          changedToFinished: false,
        };
      }

      // 1) Meeting auf FINISHED setzen
      await tx.meetings.update({
        where: { id: meetingId },
        data: { status: 'FINISHED' },
        select: { id: true },
      });

      // 2) Championship held_meetings erhöhen (nur wenn championship vorhanden)
      if (meeting.championship_id != null) {
        const championship = await tx.championships.update({
          where: { id: meeting.championship_id },
          data: { held_meetings: { increment: 1 } },
          select: {
            id: true,
            held_meetings: true,
            planned_meetings: true,
            closed: true,
          },
        });

        // 3) Optional automatisch schließen
        if (
          championship.held_meetings >= championship.planned_meetings &&
          !championship.closed
        ) {
          await tx.championships.update({
            where: { id: championship.id },
            data: { closed: true },
            select: { id: true },
          });
        }
      }

      return {
        meetingId,
        championshipId: meeting.championship_id ?? null,
        changedToFinished: true,
      };
    });
  }
}
