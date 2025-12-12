import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { SessionResultsService } from './session-result.service';
import { SessionResultsRebuildService } from './session-result-rebuild-service';

@Controller('session-result')
export class SessionResultController {
  constructor(
    private readonly sessionResultService: SessionResultsService,
    private readonly rebuildService: SessionResultsRebuildService,
  ) {}

  // GET /session-result/:id?sort=QUALY|RACE
  @Get(':id')
  getResultsBySessionId(@Param('id', ParseIntPipe) id: number) {
    return this.sessionResultService.getResultsBySessionId(id);
  }

  @Post(':id/rebuild-results')
  async rebuild(@Param('id', ParseIntPipe) id: number) {
    await this.rebuildService.rebuild(id);
    return {
      ok: true,
      session_id: id,
      message: 'Session results rebuilt from laps',
    };
  }
}
