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
}
