import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DriverStandingsService } from './driver-standings.service';
import { CreateDriverStandingDto } from './dto/create-driver-standing.dto';
import { UpdateDriverStandingDto } from './dto/update-driver-standing.dto';

@Controller('driver-standings')
export class DriverStandingsController {
  constructor(
    private readonly driverStandingsService: DriverStandingsService,
  ) {}

  // @Post()
  // create(@Body() createDriverStandingDto: CreateDriverStandingDto) {
  //   return this.driverStandingsService.create(createDriverStandingDto);
  // }

  // @Get()
  // findAll() {
  //   return this.driverStandingsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.driverStandingsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDriverStandingDto: UpdateDriverStandingDto) {
  //   return this.driverStandingsService.update(+id, updateDriverStandingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.driverStandingsService.remove(+id);
  // }
}
