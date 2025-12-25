import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Sse,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
import { ApiBody } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  SessionEvent,
  SessionsEventsService,
  SseEvent,
} from './sessions-events.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly events: SessionsEventsService,
  ) {}

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

  @Post(':id/finish')
  async finish(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.stopSession(id);
  }

  @Post('/fun')
  async createSession(@Body() data: CreateSessionDto) {
    return this.sessionsService.createSession(data);
  }

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get('/meeting/:id')
  findByChampionshipId(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findByMeetingId(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }

  @Sse('events')
  sse(): Observable<SseEvent<SessionEvent>> {
    return this.events.events$;
  }
}
