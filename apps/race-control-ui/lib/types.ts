// Core types for the Race Control application

export type SessionType = 'PRACTICE' | 'QUALI' | 'RACE';
export type SessionStatus = 'PLANNED' | 'LIVE' | 'FINISHED';
export type ChampionshipStatus = 'ACTIVE' | 'COMPLETED';
export type MeetingStatus = 'PLANNED' | 'LIVE' | 'DONE';

export interface Driver {
  id: number;
  last_name: string;
  first_name: string;
  code: string;
  color: string;
  created_at: Date;
}

export interface Championship {
  id: number;
  name: string;
  season: number;
  status: ChampionshipStatus;
  meetingsPlanned: number;
  meetingsCompleted: number;
}

export interface Meeting {
  id: number;
  championshipId: string;
  round: number;
  name: string;
  date?: string;
  status: MeetingStatus;
}

export interface Session {
  id: number;
  meetingId: string;
  type: SessionType;
  status: SessionStatus;
  durationMinutes?: number;
  laps?: number;
  startedAt?: string;
  finishedAt?: string;
}

export interface SessionEntry {
  id: number;
  sessionId: string;
  driver: Driver;
  controllerAddress: number;
  carLabel?: string;
}

export interface LapTime {
  id: number;
  sessionEntryId: string;
  lapNumber: number;
  time: number; // in milliseconds
}

export interface SessionResult {
  position: number;
  driver: Driver;
  lapsCompleted: number;
  bestLap: number;
  averageLap: number;
  pointsBase: number;
  pointsFastestLap: number;
  pointsTotal: number;
  hasFastestLap: boolean;
}

export interface DriverStanding {
  position: number;
  driver: Driver;
  points: number;
  wins: number;
  podiums: number;
}
