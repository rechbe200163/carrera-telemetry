import { Expose } from 'class-transformer';

export class CarResponseDto {
  @Expose()
  id: number;
  @Expose()
  driver_id: number;
  @Expose()
  label: string;
}
