import { SessionType } from 'generated/prisma/enums';

export const SESSION_STARTED_EVENT = 'session.started';
export type SessionStartedEvent = {
  sessionId: number;
  meetingId: number;
  sessionType: SessionType;
  lapLimit: number | null;
  timeLimitSeconds: number | null;
  startedAt: Date;
};

export const SESSION_FINISHED_EVENT = 'session.finished';
export type SessionFinishedEvent = {
  sessionId: number;
  meetingId: number | null;
  sessionType: SessionType | null;
  finishedAt: Date;
};

export const SESSION_RESULTS_READY_EVENT = 'session.results_ready';
export type SessionResultsReadyEvent = {
  sessionId: number;
  meetingId: number | null;
  championshipId: number | null;
};

export const MEETING_FINISHED_EVENT = 'meeting.finished';
export type MeetingFinishedEvent = {
  meetingId: number;
  championshipId: number | null;
  finishedAt: Date;
};
