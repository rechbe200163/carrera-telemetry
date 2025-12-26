import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { SessionType } from 'generated/prisma/enums';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Name of session',
    default: 'fun and test session',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of Session',
    default: SessionType.FUN,
    enum: SessionType,
  })
  @IsEnum(SessionType)
  sessionType: SessionType;

  @ApiProperty({
    description: 'Id of meeting',
    default: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  meetingId: number;
}
