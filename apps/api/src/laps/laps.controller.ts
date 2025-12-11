import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Sse,
  ParseIntPipe,
} from '@nestjs/common';
import { LapsService } from './laps.service';
import { CreateLapDto } from './dto/create-lap.dto';
import { UpdateLapDto } from './dto/update-lap.dto';
import { filter, map, Observable } from 'rxjs';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SseEvent } from 'lib/types';

@Controller('laps')
export class LapsController {
  constructor(
    private readonly lapsService: LapsService,
    private readonly mqttService: MqttService,
  ) {}

  @Post()
  create(@Body() createLapDto: CreateLapDto) {
    return this.lapsService.create(createLapDto);
  }

  @Get()
  findAll() {
    return this.lapsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lapsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLapDto: UpdateLapDto,
  ) {
    return this.lapsService.update(+id, updateLapDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lapsService.remove(+id);
  }

  @Sse(':sessionId/stream')
  streamLapUpdatesForSession(
    @Param('sessionId') sessionId: string,
  ): Observable<SseEvent> {
    const id = sessionId ? Number(sessionId) : undefined;

    console.log('id', id);

    return this.mqttService.lapEvents$().pipe(
      filter((event: any) => !id || event.sessionId === id),
      map((event) => ({
        data: event,
        event: 'lap-event',
      })),
    );
  }
}
