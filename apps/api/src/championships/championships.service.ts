import { Injectable } from '@nestjs/common';
import { CreateChampionshipDto } from './dto/create-champion-ship.dto';
import { UpdateChampionShipDto } from './dto/update-champion-ship.dto';
import { ChampionshipsRepo } from './championships.repo';
import { MeetingsRepo } from 'src/meetings/meetings.repo';

@Injectable()
export class ChampionshipsService {
  constructor(
    private readonly championshipsRepo: ChampionshipsRepo,
    private readonly meetingsRepo: MeetingsRepo,
  ) {}

  async create(createChampionshipDto: CreateChampionshipDto) {
    const cs = await this.championshipsRepo.create(createChampionshipDto);
  }

  findAll() {
    return this.championshipsRepo.findAll();
  }

  findOne(id: number) {
    return this.championshipsRepo.findOneById(id);
  }

  findByMettingId(meetingId: number) {
    return this.championshipsRepo.findByMettingId(meetingId);
  }

  update(id: number, updateChampionShipDto: UpdateChampionShipDto) {
    return this.championshipsRepo.update(id, updateChampionShipDto);
  }

  remove(id: number) {
    return this.championshipsRepo.remove(id);
  }
}
