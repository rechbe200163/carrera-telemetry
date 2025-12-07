import { Driver } from 'src/drivers/entities/driver.entity';
import { DriverStanding } from './driver-standing.entity';

export class DriverStandingsLeaderBoard {
  driver: Pick<Driver, 'code' | 'color' | 'id'>;
  championship: Pick<DriverStanding, 'points_total' | 'wins' | 'podiums'> & {
    position: number;
  };
}
