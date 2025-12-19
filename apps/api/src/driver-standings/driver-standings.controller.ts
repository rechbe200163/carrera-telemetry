import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { DriverStandingsService } from './driver-standings.service';
import { ApiResponse } from '@nestjs/swagger';
import { DriverStandingsLeaderBoard } from './entities/driver-standings-leaderboard.entity';

@Controller('driver-standings')
export class DriverStandingsController {
  constructor(
    private readonly driverStandingsService: DriverStandingsService,
  ) {}

  // @Post()
  // create(@Body() createDriverStandingDto: CreateDriverStandingDto) {
  //   return this.driverStandingsService.create(createDriverStandingDto);
  // }

  @ApiResponse({
    type: DriverStandingsLeaderBoard,
  })
  @Get('/championship/:id/leaderBoard')
  findAll(@Param('id', ParseIntPipe) id: number) {
    return this.driverStandingsService.getLeaderBoard(id);
  }

  @Post(':championshipId/recalculate')
  recomputeDriverStanding(@Param('championshipId') championshipId: number) {
    return this.driverStandingsService.recalculateForChampionship(
      championshipId,
    );
  }
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
