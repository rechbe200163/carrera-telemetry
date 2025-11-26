// track-lap-types.ts
export interface LapTimes {
  deviceId: string;
  lapIndex: number;
  lapStartTs: number;
  lapEndTs: number;
  sector1: number; // ms
  sector2: number; // ms
  sector3: number; // ms
  lapTime: number; // ms
}

export interface SectorTimeUpdate {
  deviceId: string;
  lapIndex: number;
  sectorId: number; // 1, 2, 3
  sectorTimeMs: number; // Zeit NUR für diesen Sektor
  lapTimeSoFarMs: number; // Zeit seit Lapbeginn bis jetzt
  lapStartTs: number;
  eventTs: number;
}

export interface TrackUpdate {
  sectorUpdate?: SectorTimeUpdate;
  lapCompleted?: LapTimes;
}
