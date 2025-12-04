import { PartialType } from '@nestjs/mapped-types';
import { CreateLapTimeDto } from './create-lap-time.dto';

export class UpdateLapTimeDto extends PartialType(CreateLapTimeDto) {}
