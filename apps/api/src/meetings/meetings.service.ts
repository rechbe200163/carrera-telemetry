import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingsRepo } from './meetings.repo';

@Injectable()
export class MeetingsService {
  constructor(private readonly meetingsRepo: MeetingsRepo) {}

  getMeeting(championshipId: number) {
    return this.meetingsRepo.getMeeting(championshipId);
  }

  listMeetingsByChampionship(id: number) {
    return this.meetingsRepo.listMeetingsByChampionship(id);
  }
}
