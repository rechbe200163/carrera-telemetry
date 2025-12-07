// enums
export type Stauts = 'PLANNED' | 'LIVE' | 'FINISHED' | 'CANCELLED';
export type SessionType = 'FUN' | 'PRACTICE' | 'QUALYFING' | 'RACE';

// Models (field names kept like in your Prisma schema)
export interface Championships {
  id: number;
  name: string;
  season: number;
  planned_meetings: number;
  held_meetings: number;
  closed: boolean;
  created_at: Date;
  // relations (optional to avoid deep circular types when not populated)
  driver_standings?: DriverStandings[];
  meetings?: Meetings[];
}

export interface Controllers {
  id: number;
  address: number;
  name: string;
  icon?: string | null;
  notes: string;
  created_at: Date;
  session_entries?: SessionEntries[];
}

export interface DriverStandings {
  id: number;
  championship_id: number;
  driver_id: number;
  points_total: number;
  wins: number;
  podiums: number;
  races_started: number;
  last_updated: Date;
  // relations
  championships?: Championships;
  drivers?: Drivers;
}

export interface Drivers {
  id: number;
  last_name: string;
  created_at: Date;
  code: string;
  first_name: string;
  color: string;
  driver_standings?: DriverStandings[];
  laps?: Laps[];
  session_entries?: SessionEntries[];
  session_results?: SessionResults[];
}

export interface Laps {
  id: number;
  session_id: number;
  driver_id: number;
  lap_number: number;
  date_start: Date;
  lap_duration_ms: number;
  duration_sector1?: number | null;
  duration_sector2?: number | null;
  duration_sector3?: number | null;
  is_pit_out_lap: boolean;
  is_valid: boolean;
  created_at: Date;
  // relations
  drivers?: Drivers;
  sessions?: Sessions;
}

export interface Meetings {
  id: number;
  championship_id?: number | null;
  round_number?: number | null;
  name?: string | null;
  start_date?: Date | null; // @db.Date
  end_date?: Date | null; // @db.Date
  status: Stauts;
  created_at: Date;
  // relations
  championships?: Championships | null;
  sessions?: Sessions[];
}

export interface SessionEntries {
  id: number;
  session_id: number;
  driver_id: number;
  controller_id?: number | null;
  controller_address: number;
  car_label?: string | null;
  created_at: Date;
  // relations
  controllers?: Controllers | null;
  drivers?: Drivers;
  sessions?: Sessions;
}

export interface SessionResults {
  id: number;
  session_id: number;
  driver_id: number;
  position: number;
  best_lap_ms?: number | null;
  avg_lap_ms?: number | null;
  laps_completed: number;
  points_base: number;
  points_fastest_lap: number;
  points_total: number;
  created_at: Date;
  // relations
  drivers?: Drivers;
  sessions?: Sessions;
}

export interface Sessions {
  id: number;
  meeting_id: number;
  session_type: SessionType;
  name: string;
  start_time?: Date | null;
  end_time?: Date | null;
  status: Stauts;
  time_limit_seconds?: number | null;
  lap_limit?: number | null;
  created_at: Date;
  // relations
  laps?: Laps[];
  session_entries?: SessionEntries[];
  session_results?: SessionResults[];
  meetings?: Meetings;
}

export interface LeaderBoard {
  driver: Pick<Drivers, 'code' | 'color' | 'id'>;
  championship: Pick<DriverStandings, 'points_total' | 'wins' | 'podiums'> & {
    position: number;
  };
}
