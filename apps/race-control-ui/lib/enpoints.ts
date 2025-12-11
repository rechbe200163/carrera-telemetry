export const ENDPOINTS = {
  // --- Drivers ---
  DRIVERS: {
    POST: '/drivers',
    GET: '/drivers',
    GET_ID: (id: number) => `/drivers/${id}`,
    PATCH: (id: number) => `/drivers/${id}`,
    DELETE: (id: number) => `/drivers/${id}`,
  },

  // --- Controllers ---
  CONTROLLERS: {
    POST: '/controllers',
    GET: '/controllers',
    GET_ID: (id: number) => `/controllers/${id}`,
    PATCH: (id: number) => `/controllers/${id}`,
    DELETE: (id: number) => `/controllers/${id}`,
  },

  // --- Cars ---
  CARS: {
    POST: '/cars',
    GET: '/cars',
    GET_ID: (id: number) => `/cars/${id}`,
    PATCH: (id: number) => `/cars/${id}`,
    DELETE: (id: number) => `/cars/${id}`,
  },

  // --- Tracks ---
  TRACKS: {
    POST: '/tracks',
    GET: '/tracks',
    GET_ID: (id: number) => `/tracks/${id}`,
    PATCH: (id: number) => `/tracks/${id}`,
    DELETE: (id: number) => `/tracks/${id}`,
  },

  // --- Championships ---
  CHAMPIONSHIPS: {
    POST: '/championships',
    GET: '/championships',
    GET_ID: (id: number) => `/championships/${id}`,
    PATCH: (id: number) => `/championships/${id}`,
    DELETE: (id: number) => `/championships/${id}`,

    // Subresource: Races einer Championship
    RACES: (champId: number) => `/championships/${champId}/races`,
    RACE_ID: (champId: number, raceId: number) =>
      `/championships/${champId}/races/${raceId}`,
    MEETING_ID: (meetingId: number) => `/championships/meeting/${meetingId}`,
  },

  // --- Races (falls du die auch separat willst) ---
  RACES: {
    POST: '/races',
    GET: '/races',
    GET_ID: (id: number) => `/races/${id}`,
    PATCH: (id: number) => `/races/${id}`,
    DELETE: (id: number) => `/races/${id}`,
  },

  LAPS: {
    POST: '/laps',
    GET: '/laps',
    GET_ID: (id: number) => `/laps/${id}`,
    PATCH: (id: number) => `/laps/${id}`,
    DELETE: (id: number) => `/laps/${id}`,
    LIVE_LAPS: (sessionId: number) => `/laps/${sessionId}/stream`,
  },

  // --- Race Events ---
  RACE_EVENTS: {
    POST: '/race-events',
    GET: '/race-events',
    GET_ID: (id: number) => `/race-events/${id}`,
    PATCH: (id: number) => `/race-events/${id}`,
    DELETE: (id: number) => `/race-events/${id}`,
  },

  // --- Sessions ---
  SESSIONS: {
    POST: '/sessions',
    GET: '/sessions',
    START: (id: number) => `/sessions/${id}/start`,
    GET_ID: (id: number) => `/sessions/${id}`,
    PATCH: (id: number) => `/sessions/${id}`,
    DELETE: (id: number) => `/sessions/${id}`,
    GET_BY_MEETING_ID: (meetingId: number) => `/sessions/meeting/${meetingId}`,
  },

  // --- Session Entries (Driver/Controller Paarung) ---
  SESSION_ENTRIES: {
    POST: (id: number) => `/sessions/${id}/entries`,
    GET: '/session-entries',
    GET_ID: (id: number) => `/session-entries/${id}`,
    PATCH: (id: number) => `/session-entries/${id}`,
    DELETE: (id: number) => `/session-entries/${id}`,
    GET_BY_SESSION_ID: (sessionId: number) => `/sessions/${sessionId}/entries`,
  },

  SESSION_RESULTS: {
    GET_ID: (id: number) => `/session-result/${id}`,
  },

  DRIVER_STANDINGS: {
    POST: '/driver-standings',
    GET: '/driver-standings',
    GET_ID: (id: number) => `/driver-standings/${id}`,
    PATCH: (id: number) => `/driver-standings/${id}`,
    DELETE: (id: number) => `/driver-standings/${id}`,
    GET_BY_CHAMPIONSHIP_ID: (championsshipId: number) =>
      `/driver-standings/championship/${championsshipId}/leaderBoard`,
  },

  MEETINGS: {
    POST: '/meetings',
    POST_GEN_NEXT_MEETING: (id: number) =>
      `/meetings/gen-next/championship/${id}/meetings`,
    GET: '/meetings',
    GET_ID: (id: number) => `/meetings/${id}`,
    PATCH: (id: number) => `/meetings/${id}`,
    DELETE: (id: number) => `/meetings/${id}`,
    GET_BY_CHAMPIONSHIP_ID: (championsshipId: number) =>
      `/meetings/championships/${championsshipId}/meetings`,
  },
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;
