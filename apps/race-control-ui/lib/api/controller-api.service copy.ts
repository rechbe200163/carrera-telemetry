// lib/api/driver-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { Controller, Driver } from '../types';
import { ENDPOINTS } from '../enpoints';

export class ControllersApiService {
  private static instance: ControllersApiService;

  static getInstance(): ControllersApiService {
    if (!this.instance) {
      this.instance = new ControllersApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getAll(): Promise<Controller[]> {
    return this.baseClient.get<Controller[]>(
      ENDPOINTS.CONTROLLERS.GET_CONTROLLER
    );
  }

  async getById(id: number): Promise<Controller> {
    return this.baseClient.get<Controller>(
      ENDPOINTS.CONTROLLERS.GET_CONTROLLER_ID(id)
    );
  }

  // Optional: Suche
  async search(query: string): Promise<Controller[]> {
    return this.baseClient.get<Controller[]>(
      `/drivers?query=${encodeURIComponent(query)}`
    );
  }
}

export const controllerApiService = ControllersApiService.getInstance();
