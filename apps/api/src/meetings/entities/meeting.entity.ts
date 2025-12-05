import { Expose } from 'class-transformer';

export class Meetings {
  @Expose()
  id: number;
  @Expose()
  championship_id: number | null;
  @Expose()
  round_number: number | null;
  @Expose()
  name: string | null;
  @Expose()
  start_date: Date | null;
  @Expose()
  end_date: Date | null;
  @Expose()
  stauts?: string;
}
