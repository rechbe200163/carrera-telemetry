// car-telemetry.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CarTelemetryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  carId: number;

  // Acceleration (m/s^2)
  @Type(() => Number)
  @IsNumber()
  accelX: number;

  @Type(() => Number)
  @IsNumber()
  accelY: number;

  @Type(() => Number)
  @IsNumber()
  accelZ: number;

  // Gyro (°/s)
  @Type(() => Number)
  @IsNumber()
  gyroX: number;

  @Type(() => Number)
  @IsNumber()
  gyroY: number;

  @Type(() => Number)
  @IsNumber()
  gyroZ: number;

  // Magnetometer optional
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  magX?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  magY?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  magZ?: number;

  // Derived values optional
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  speed?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  yaw?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  pitch?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  roll?: number;

  @Type(() => Number)
  @IsNumber()
  ts: number; // Unix ms
}
