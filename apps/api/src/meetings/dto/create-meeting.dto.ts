import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMeetingDto {
  @ApiProperty({
    description: 'Name of the round',
    example: 'Round 1',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Datetime when the Meeting will take place',
    example: '2025-12-09T18:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  start_date?: Date;
}
