import { PartialType } from '@nestjs/swagger';
import { CreateDriverStandingDto } from './create-driver-standing.dto';

export class UpdateDriverStandingDto extends PartialType(CreateDriverStandingDto) {}
