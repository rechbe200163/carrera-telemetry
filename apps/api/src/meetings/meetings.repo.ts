import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { Meetings } from './entities/meeting.entity';
import { SessionsRepo } from 'src/sessions/sessions.repo'; // <-- wichtig

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
  async createMeetingWithDefaultSessions(championshipId: number) {
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
        name: `Round ${nextRound}`,
        status: 'PLANNED',
      },
    });

    // 3) Default Sessions anlegen
    await this.sessionsRepo.createDefaultSessionsForMeeting(meeting.id);

    return meeting;
  }
}
