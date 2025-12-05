import { PartialType } from '@nestjs/swagger';
import { CreateSessionEntryDto } from './create-session-entry.dto';

export class UpdateSessionEntryDto extends PartialType(CreateSessionEntryDto) {}
