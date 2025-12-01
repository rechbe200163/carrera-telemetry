export const Topics = {
  trackReedEvent: 'track/reed/event/',
  flagEvent: (sector = '+', flag = '+') =>
    `flag/sector/${sector}/flag/${flag}/`,
} as const;
