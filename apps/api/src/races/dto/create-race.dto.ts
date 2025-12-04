import { IsOptional, IsString } from 'class-validator';

export class CreateRaceDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly track?: string;
}
