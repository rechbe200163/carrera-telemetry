export class CreateSessionResultDto {
  session_id!: number;
  driver_id!: number;
  position!: number;
  best_lap_ms?: number | null;
  avg_lap_ms?: number | null;
  total_time_ms: number;
  laps_completed?: number;
  points_base?: number;
  points_fastest_lap?: number;
  points_total?: number;
}
