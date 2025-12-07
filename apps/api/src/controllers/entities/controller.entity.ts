import { Expose } from 'class-transformer';

export class Controller {
  @Expose()
  id: number;
  @Expose()
  address: number;
  @Expose()
  name: string;
  @Expose()
  icon: string;
}
