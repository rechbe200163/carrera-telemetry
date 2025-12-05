export class CreateSessionEntryDto {
  session_id!: number;
  driver_id!: number;
  controller_address!: number;
  controller_id?: number | null;
  car_label?: string | null;
}
