// track-reed-event.dto.ts
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class TrackReedEventDto {
  @IsString()
  deviceId: string; // z.B. "track-controller-1"

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sectorId: number; // 0 = Start/Finish, 1 = S1, 2 = S2 ...

  @IsBoolean()
  value: boolean; // true = reed magnet detected (rising edge)

  @Type(() => Number)
  @IsNumber()
  ts: number; // Unix timestamp in ms
}
