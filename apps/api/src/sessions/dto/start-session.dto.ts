import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class StartSessionDto {
  @ApiProperty({
    description: 'Duration in minutes of the Quali or Practice Session',
    example: 30,
  })
  @IsInt()
  @IsOptional()
  durationMinutes?: number; // für PRACTICE / QUALI
  @ApiProperty({
    description: 'how many laps the race should have',
    example: 71,
  })
  @IsInt()
  @IsOptional()
  lapLimit?: number; // für RACE
}
