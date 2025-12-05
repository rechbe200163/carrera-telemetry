import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateSessionResultDto } from './dto/create-session-result.dto';
import { UpdateSessionResultDto } from './dto/update-session-result.dto';
import { SessionResultsService } from './session-result.service';

@Controller('session-result')
export class SessionResultController {
  constructor(private readonly sessionResultService: SessionResultsService) {}
}
