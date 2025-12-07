// lib/api/driver-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { Drivers } from '../types';
import { ENDPOINTS } from '../enpoints';

export class DriverApiService {
  private static instance: DriverApiService;

  static getInstance(): DriverApiService {
    if (!this.instance) {
      this.instance = new DriverApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getAll(): Promise<Drivers[]> {
    return this.baseClient.get<Drivers[]>(ENDPOINTS.DRIVERS.GET);
  }

  async getById(id: number): Promise<Drivers> {
    return this.baseClient.get<Drivers>(ENDPOINTS.DRIVERS.GET_ID(id));
  }

  async getByCode(code: string): Promise<Drivers> {
    return this.baseClient.get<Drivers>('/drivers/by-code?code=' + code);
    // oder:
    // return this.baseClient.get<Drivers>('/drivers/by-code', { code });
    // wenn du request+query erweitern willst
  }

  // Optional: Suche
  async search(query: string): Promise<Drivers[]> {
    return this.baseClient.get<Drivers[]>(
      `/drivers?query=${encodeURIComponent(query)}`
    );
  }
}

export const driverApiService = DriverApiService.getInstance();
