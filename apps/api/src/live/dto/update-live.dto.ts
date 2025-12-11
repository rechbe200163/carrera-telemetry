import { PartialType } from '@nestjs/swagger';
import { CreateLiveDto } from './create-live.dto';

export class UpdateLiveDto extends PartialType(CreateLiveDto) {}
