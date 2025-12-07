// lib/api/driver-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Controllers } from '../types';

export class ControllersApiService {
  private static instance: ControllersApiService;

  static getInstance(): ControllersApiService {
    if (!this.instance) {
      this.instance = new ControllersApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getAll(): Promise<Controllers[]> {
    return this.baseClient.get<Controllers[]>(ENDPOINTS.CONTROLLERS.GET);
  }

  async getById(id: number): Promise<Controllers> {
    return this.baseClient.get<Controllers>(ENDPOINTS.CONTROLLERS.GET_ID(id));
  }

  // Optional: Suche
  async search(query: string): Promise<Controllers[]> {
    return this.baseClient.get<Controllers[]>(
      `/drivers?query=${encodeURIComponent(query)}`
    );
  }
}

export const controllerApiService = ControllersApiService.getInstance();
