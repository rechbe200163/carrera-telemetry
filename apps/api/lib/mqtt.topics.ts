export const Topics = {
  trackReedEvent: (sektor = '+', turn = '+', lane = '+') =>
    `track/reed/sector/${sektor}/turn/${turn}/lane/${lane}/`,
  flagEvent: (sector = '+', flag = '+') =>
    `flag/sector/${sector}/flag/${flag}/`,
} as const;
