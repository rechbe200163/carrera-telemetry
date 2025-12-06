// lib/api/driver-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { Driver } from '../types';

export class DriverApiService {
  private static instance: DriverApiService;

  static getInstance(): DriverApiService {
    if (!this.instance) {
      this.instance = new DriverApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getAll(): Promise<Driver[]> {
    return this.baseClient.get<Driver[]>('/drivers');
  }

  async getById(id: number | string): Promise<Driver> {
    return this.baseClient.get<Driver>(`/drivers/${id}`);
  }

  async getByCode(code: string): Promise<Driver> {
    return this.baseClient.get<Driver>('/drivers/by-code?code=' + code);
    // oder:
    // return this.baseClient.get<Driver>('/drivers/by-code', { code });
    // wenn du request+query erweitern willst
  }

  // Optional: Suche
  async search(query: string): Promise<Driver[]> {
    return this.baseClient.get<Driver[]>(
      `/drivers?query=${encodeURIComponent(query)}`
    );
  }
}

export const driverApiService = DriverApiService.getInstance();
