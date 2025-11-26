export const Topics = {
  carTelemetry: (carId = '+') => `car/${carId}/telemetry`,
  trackReedEvent: (sectorId = '+') => `sector/${sectorId}/reed-event`,
} as const;
