// lib/cache-keys.ts

export const CACHE_KEYS = {
  // ---- DRIVERS ----
  drivers: 'drivers',
  driver: (id: number) => `driver-${id}`,

  // ---- CONTROLLERS ----
  controllers: 'controllers',
  controller: (id: number) => `controller-${id}`,

  // ---- CARS ----
  cars: 'cars',
  car: (id: number) => `car-${id}`,

  // ---- TRACKS ----
  tracks: 'tracks',
  track: (id: number) => `track-${id}`,

  // ---- CHAMPIONSHIPS ----
  championships: 'championships',
  championship: (id: number) => `championship-${id}`,
  championshipRaces: (champId: number) => `championship-${champId}-races`,
  championshipRace: (champId: number, raceId: number) =>
    `championship-${champId}-race-${raceId}`,
  championshipMeeting: (meetingId: number) =>
    `championship-meeting-${meetingId}`,

  // ---- RACES ----
  races: 'races',
  race: (id: number) => `race-${id}`,

  // ---- LAPS ----
  laps: 'laps',
  lap: (id: number) => `lap-${id}`,
  sessionLiveLaps: (sessionId: number) => `session-${sessionId}-live-laps`,

  // ---- RACE EVENTS ----
  raceEvents: 'race-event',
  raceEvent: (id: number) => `race-event-${id}`,

  // ---- SESSIONS ----
  sessions: 'sessions',
  session: (id: number) => `session-${id}`,
  sessionsByMeeting: (meetingId: number) => `sessions-meeting-${meetingId}`,

  // ---- SESSION ENTRIES ----
  sessionEntries: 'session-entries',
  sessionEntry: (id: number) => `session-entry-${id}`,
  sessionEntriesBySession: (sessionId: number) =>
    `session-entries-${sessionId}`,

  // ---- SESSION RESULTS ----
  sessionResultsById: (sessionId: number) => `session-results-${sessionId}`,

  // ---- DRIVER STANDINGS ----
  driverStandings: 'driver-standings',
  driverStanding: (id: number) => `driver-standing-${id}`,
  driverStandingsByChampionship: (champId: number) =>
    `driver-standings-championship-${champId}`,

  // ---- MEETINGS ----
  meetings: 'meetings',
  meeting: (id: number) => `meeting-${id}`,
  meetingsByChampionship: (championshipId: number) =>
    `meetings-championship-${championshipId}`,

  statsBySessionEveryLap: (sessionId: number) =>
    `stats-laps-session-${sessionId}`,
} as const;

export type CacheKey = keyof typeof CACHE_KEYS;
