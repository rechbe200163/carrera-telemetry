import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCarDto {
  @ApiProperty({
    description: 'The label of the car',
    example: 'Car A',
  })
  @IsString()
  @IsNotEmpty()
  readonly label: string;

  @ApiProperty({
    description: 'The ID of the driver',
    example: 1,
    required: false,
  })
  @IsOptional()
  readonly driver_id?: number;
}
