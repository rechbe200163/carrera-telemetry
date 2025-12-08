import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Controller,
  ParseIntPipe,
} from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { CreateChampionshipDto } from './dto/create-champion-ship.dto';
import { UpdateChampionShipDto } from './dto/update-champion-ship.dto';

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @Post()
  create(@Body() createChampionshipDto: CreateChampionshipDto) {
    return this.championshipsService.create(createChampionshipDto);
  }

  @Get()
  findAll() {
    return this.championshipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.championshipsService.findOne(+id);
  }

  @Get('meeting/:id')
  findOneByMeetingId(@Param('id', ParseIntPipe) id: number) {
    return this.championshipsService.findByMettingId(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChampionShipDto: UpdateChampionShipDto,
  ) {
    return this.championshipsService.update(+id, updateChampionShipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.championshipsService.remove(+id);
  }
}
