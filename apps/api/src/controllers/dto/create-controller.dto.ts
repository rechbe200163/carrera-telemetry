import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateControllerDto {
  @ApiProperty({ example: 1, description: 'The address of the controller' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  address: number;
  @ApiProperty({
    example: 'Controller 1',
    description: 'The name of the controller',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;
  @ApiProperty({
    example: '#FF0000',
    description: 'The color of the controller',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  icon?: string;

  @ApiProperty({
    example: 'additional notes',
    description: 'mega controller',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  notes: string;
}
