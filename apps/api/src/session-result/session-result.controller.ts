import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SessionResultsService } from './session-result.service';

@Controller('session-result')
export class SessionResultController {
  constructor(private readonly sessionResultService: SessionResultsService) {}

  @Get(':id')
  getResultsBySessionId(@Param('id', ParseIntPipe) id: number) {
    return this.sessionResultService.getResultsBySessionId(id);
  }
}
