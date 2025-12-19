import { Injectable, Logger } from '@nestjs/common';
import { CreateLapDto } from './dto/create-lap.dto';
import { UpdateLapDto } from './dto/update-lap.dto';
import { Observable, Subject } from 'rxjs';
import { LapsRepo } from './laps.repo';

@Injectable()
export class LapsService {
  private readonly logger = new Logger(LapsService.name);
  private readonly lapStream$ = new Subject<MessageEvent>();

  constructor(private readonly lapsRepo: LapsRepo) {}

  // Wird von deinem MQTT-Consumer benutzt
  async createFromEvent(dto: CreateLapDto) {
    const lap = await this.lapsRepo.create(dto);

    // Live-Update für SSE raushauen
    this.lapStream$.next({
      // du kannst hier auch "event: 'lap'" setzen, wenn du willst
      data: {
        type: 'lap',
        lap,
      },
    } as MessageEvent);

    return lap;
  }

  findBySessionIdDriverId(sessionId: number, driverId: number) {
    return this.lapsRepo.findBySessionAndDriver(sessionId, driverId);
  }

  create(createLapDto: CreateLapDto) {
    return 'This action adds a new lap';
  }

  findAll() {
    return `This action returns all laps`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lap`;
  }

  update(id: number, updateLapDto: UpdateLapDto) {
    return `This action updates a #${id} lap`;
  }

  remove(id: number) {
    return `This action removes a #${id} lap`;
  }
}
