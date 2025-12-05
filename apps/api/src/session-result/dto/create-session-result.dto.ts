export class CreateSessionResultDto {
  session_id!: number;
  driver_id!: number;
  position!: number;
  best_lap_ms?: number | null;
  avg_lap_ms?: number | null;
  laps_completed?: number; // default 0 in DB
  points_base?: number; // default 0
  points_fastest_lap?: number; // default 0
  points_total?: number; // default 0
}
