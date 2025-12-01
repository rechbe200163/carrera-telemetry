export const Topics = {
  exitTurnEvent: (sector = '+', lane = '+', turn = '+') =>
    `track/exit/sector/${sector}/lane/${lane}/turn/${turn}/`,
  entryTurnEvent: (sector = '+', lane = '+', turn = '+') =>
    `track/entry/sector/${sector}/lane/${lane}/turn/${turn}/`,
  flagEvent: (sector = '+', flag = '+') =>
    `flag/sector/${sector}/flag/${flag}/`,
} as const;
