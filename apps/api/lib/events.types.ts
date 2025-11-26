export enum Sectors {
  START_FINISH = 0,
  SECTOR_1 = 1,
  SECTOR_2 = 2,
}

export type CarTelemetry = {
  carId: number; // eindeutige Fahrzeug-ID, fix am Auto vergeben

  // IMU raw sensor data
  accelX: number; // m/s^2
  accelY: number;
  accelZ: number;

  gyroX: number; // °/s
  gyroY: number;
  gyroZ: number;

  // optional magnetometer falls MPU9250
  magX?: number;
  magY?: number;
  magZ?: number;

  // optional derived values (vom ESP oder Backend berechnet)
  speed?: number; // km/h oder m/s
  yaw?: number; // Orientierung
  pitch?: number;
  roll?: number;

  ts: number; // UNIX timestamp in ms
};

export type TrackReedEvent = {
  deviceId: string;
  sectorId: number; // 0, 1, 2 ...
  value: boolean; // rising edge = true
  ts: number;
};
