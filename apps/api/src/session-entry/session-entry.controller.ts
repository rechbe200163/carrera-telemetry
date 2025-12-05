import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateSessionEntryDto } from './dto/create-session-entry.dto';
import { SessionEntriesService } from './session-entry.service';

@Controller('sessions/:sessionId/entries')
export class SessionEntriesController {
  constructor(private readonly service: SessionEntriesService) {}

  @Post()
  async create(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: CreateSessionEntryDto,
  ) {
    return this.service.assignDriverToController(sessionId, dto);
  }

  @Get()
  async list(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.service.listEntries(sessionId);
  }
}
