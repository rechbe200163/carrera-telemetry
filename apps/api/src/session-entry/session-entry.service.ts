import { Injectable } from '@nestjs/common';
import { CreateSessionEntryDto } from './dto/create-session-entry.dto';
import { UpdateSessionEntryDto } from './dto/update-session-entry.dto';

@Injectable()
export class SessionEntryService {
  create(createSessionEntryDto: CreateSessionEntryDto) {
    return 'This action adds a new sessionEntry';
  }

  findAll() {
    return `This action returns all sessionEntry`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sessionEntry`;
  }

  update(id: number, updateSessionEntryDto: UpdateSessionEntryDto) {
    return `This action updates a #${id} sessionEntry`;
  }

  remove(id: number) {
    return `This action removes a #${id} sessionEntry`;
  }
}
