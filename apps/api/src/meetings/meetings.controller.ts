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
import { ApiBody } from '@nestjs/swagger';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @ApiBody({
    type: CreateMeetingDto,
  })
  @Post('/gen-next/championship/:id/meetings')
  genNextMeeting(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateMeetingDto,
  ) {
    console.log(data, id);
    return this.meetingsService.createNextMeeting(id, data);
  }

  @Get()
  async getAll() {
    return this.meetingsService.getAll();
  }
  @Get('/:id')
  async getMeeting(@Param('id', ParseIntPipe) id: number) {
    return this.meetingsService.getMeeting(id);
  }

  @Get('championships/:id/meetings')
  async listByChampionship(@Param('id', ParseIntPipe) id: number) {
    return this.meetingsService.listMeetingsByChampionship(id);
  }
}
