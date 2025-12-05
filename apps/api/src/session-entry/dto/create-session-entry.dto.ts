export class SessionEntry {
  id!: number;
  session_id!: number;
  driver_id!: number;
  controller_id?: number | null;
  controller_address!: number;
  car_label?: string | null;
  created_at!: Date;
}
