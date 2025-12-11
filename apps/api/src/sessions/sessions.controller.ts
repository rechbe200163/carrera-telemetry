import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiBody({
    type: StartSessionDto,
  })
  @Post(':id/start')
  async startSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: StartSessionDto,
  ) {
    return this.sessionsService.startSession(id, data);
  }

  @Post(':id/abort')
  async abort(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.abortSession(id);
  }

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }

  @Get('/meeting/:id')
  findByChampionshipId(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findByMeetingId(id);
  }
}
