import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingsRepo } from './meetings.repo';
import { Meetings } from './entities/meeting.entity';

@Injectable()
export class MeetingsService {
  constructor(private readonly meetingsRepo: MeetingsRepo) {}

  getMeeting(id: number): Promise<Meetings | null> {
    return this.meetingsRepo.getMeeting(id);
  }

  listMeetingsByChampionship(id: number) {
    return this.meetingsRepo.listMeetingsByChampionship(id);
  }
  getAll() {
    return this.meetingsRepo.getAll();
  }

  createNextMeeting(championshipId: number, data: CreateMeetingDto) {
    console.log(data);
    return this.meetingsRepo.createMeetingWithDefaultSessions(
      championshipId,
      data,
    );
  }
}
