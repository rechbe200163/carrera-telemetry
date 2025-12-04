import { PartialType } from '@nestjs/swagger';
import { CreateChampionshipDto } from './create-champion-ship.dto';

export class UpdateChampionShipDto extends PartialType(CreateChampionshipDto) {}
