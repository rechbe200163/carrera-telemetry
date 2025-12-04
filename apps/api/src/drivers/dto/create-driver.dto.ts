import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class CreateDriverDto {
  @ApiProperty({
    description: 'Name of the driver',
    example: 'Max',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly first_name: string;

  @ApiProperty({
    description: 'Surname of the driver',
    example: 'Verstappen',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly last_name: string;
}
