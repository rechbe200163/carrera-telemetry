export const Topics = {
  trackReedEvent: (sektor = '+', turn = '+', lane = '+') =>
    `track/reed/${sektor}/${turn}/${lane}/`,
} as const;
