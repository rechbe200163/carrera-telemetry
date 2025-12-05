export class CreateLapDto {
  session_id!: number;
  driver_id!: number;
  lap_number!: number;
  date_start!: Date;
  lap_duration_ms!: number;
  duration_sector1?: number | null;
  duration_sector2?: number | null;
  duration_sector3?: number | null;
  is_pit_out_lap?: boolean; // default false in DB
  is_valid?: boolean; // default true in DB
}
