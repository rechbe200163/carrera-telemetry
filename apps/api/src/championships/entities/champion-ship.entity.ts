import { Exclude, Expose } from 'class-transformer';

export class ChampionShip {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  season: number;
  @Expose()
  planned_meetings?: number;
  @Expose()
  held_meetings?: number;
  @Expose()
  closed: boolean;
  @Expose()
  created_at: Date;
}
