import { PartialType } from '@nestjs/mapped-types';
import { CreateCrashDetectionDto } from './create-crash-detection.dto';

export class UpdateCrashDetectionDto extends PartialType(CreateCrashDetectionDto) {
  id: number;
}
