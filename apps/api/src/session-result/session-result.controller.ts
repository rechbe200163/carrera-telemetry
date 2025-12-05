import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionResultService } from './session-result.service';
import { CreateSessionResultDto } from './dto/create-session-result.dto';
import { UpdateSessionResultDto } from './dto/update-session-result.dto';

@Controller('session-result')
export class SessionResultController {
  constructor(private readonly sessionResultService: SessionResultService) {}

  @Post()
  create(@Body() createSessionResultDto: CreateSessionResultDto) {
    return this.sessionResultService.create(createSessionResultDto);
  }

  @Get()
  findAll() {
    return this.sessionResultService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionResultService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionResultDto: UpdateSessionResultDto) {
    return this.sessionResultService.update(+id, updateSessionResultDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionResultService.remove(+id);
  }
}
