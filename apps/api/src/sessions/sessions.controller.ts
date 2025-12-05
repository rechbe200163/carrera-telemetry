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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
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
}
