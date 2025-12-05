export class SessionResult {
  id!: number;
  session_id!: number;
  driver_id!: number;
  position!: number;
  best_lap_ms?: number | null;
  avg_lap_ms?: number | null;
  laps_completed!: number;
  points_base!: number;
  points_fastest_lap!: number;
  points_total!: number;
  created_at!: Date;
}
