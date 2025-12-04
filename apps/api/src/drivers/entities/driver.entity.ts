import { Expose } from 'class-transformer';

export class Driver {
  @Expose()
  id: number;
  @Expose()
  first_name: string;
  @Expose()
  last_name: string;
  @Expose()
  code: string;
  @Expose()
  created_at: Date;
}
