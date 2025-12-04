import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LapTimesService } from './lap-times.service';
import { CreateLapTimeDto } from './dto/create-lap-time.dto';
import { EventPattern } from '@nestjs/microservices';

@Controller('lap-times')
export class LapTimesController {
  constructor(private readonly lapTimesService: LapTimesService) {}

  @EventPattern('carrera/cu/lapTimes')
  create(@Body() createLapTimeDto: CreateLapTimeDto) {
    return this.lapTimesService.create(createLapTimeDto);
  }
}
