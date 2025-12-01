export enum Sectors {
  START_FINISH = 0,
  SECTOR_1 = 1,
  SECTOR_2 = 2,
}

export type TrackReedEvent = {
  deviceId: string;
  sectorId: number; // 0, 1, 2 ...
  laneId: number; // 0, 1, 2 ...
  turnId: number; // 0, 1, 2 ...
  isExit: boolean;
  ts: number;
};
