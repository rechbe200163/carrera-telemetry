import { PartialType } from '@nestjs/swagger';
import { CreateLapDto } from './create-lap.dto';

export class UpdateLapDto extends PartialType(CreateLapDto) {}
