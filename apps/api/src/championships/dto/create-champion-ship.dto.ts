import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChampionshipDto {
  @ApiProperty({
    example: 'World Championship',
    description: 'The name of the championship',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;
  @ApiProperty({
    example: 2024,
    description: 'The season year of the championship',
  })
  @IsNumber()
  season: number;
  @ApiProperty({
    example: 10,
    description: 'The planned number of meetings in the championship',
  })
  @IsOptional()
  @IsNumber()
  planned_meetings: number;
}
