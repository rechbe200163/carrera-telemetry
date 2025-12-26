import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Sse,
  HttpCode,
  HttpStatus,
  BadRequestException,
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
import { SessionType } from 'generated/prisma/enums';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly events: SessionsEventsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.BAD_REQUEST)
  async createSession(@Body() data: CreateSessionDto) {
    if (data.sessionType !== SessionType.FUN)
      throw new BadRequestException(
        'Only FUN sessions can be created manually for now.',
      );

    return this.sessionsService.createSession(data);
  }

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
  @HttpCode(HttpStatus.OK)
  async abort(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.abortSession(id);
  }

  @Post(':id/finish')
  @HttpCode(HttpStatus.OK)
  async finish(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.sessionsService.stopSession(id);
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
