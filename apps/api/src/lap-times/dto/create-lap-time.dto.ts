export class CreateLapTimeDto {
  car_id: number;
  race_id?: number;
  lap_number: number;
  lap_time_ms: number;
  sector1_ms?: number;
  sector2_ms?: number;
  sector3_ms?: number;
}
