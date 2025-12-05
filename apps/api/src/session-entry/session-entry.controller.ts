import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionEntryService } from './session-entry.service';
import { CreateSessionEntryDto } from './dto/create-session-entry.dto';
import { UpdateSessionEntryDto } from './dto/update-session-entry.dto';

@Controller('session-entry')
export class SessionEntryController {
  constructor(private readonly sessionEntryService: SessionEntryService) {}

  @Post()
  create(@Body() createSessionEntryDto: CreateSessionEntryDto) {
    return this.sessionEntryService.create(createSessionEntryDto);
  }

  @Get()
  findAll() {
    return this.sessionEntryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionEntryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionEntryDto: UpdateSessionEntryDto) {
    return this.sessionEntryService.update(+id, updateSessionEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionEntryService.remove(+id);
  }
}
