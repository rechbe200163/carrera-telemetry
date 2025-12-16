export class DriverStanding {
  id: number;
  championship_id: number;
  driver_id: number;
  points_total: number;
  wins: number;
  podiums: number;
  races_started: number;
  best_finish_position?: number | null;
}
