import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}

  @Get('meetings/:id')
  async getMeeting(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMeeting(id);
  }

  @Get('championships/:id/meetings')
  async listByChampionship(@Param('id', ParseIntPipe) id: number) {
    return this.service.listMeetingsByChampionship(id);
  }
}
