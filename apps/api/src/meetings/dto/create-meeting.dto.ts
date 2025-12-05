import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsNumber()
  @IsOptional()
  championship_id?: number;
  @IsNumber()
  round_number?: number;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  name?: string;
  @IsDate()
  @IsOptional()
  start_date?: Date;
  @IsDate()
  @IsOptional()
  end_date?: Date;
}
