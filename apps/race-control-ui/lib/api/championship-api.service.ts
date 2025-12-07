'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Championships } from '../types';

export class ChampionShipApiService {
  private static instance: ChampionShipApiService;

  static getInstance(): ChampionShipApiService {
    if (!this.instance) {
      this.instance = new ChampionShipApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getAll(): Promise<Championships[]> {
    return this.baseClient.get<Championships[]>(ENDPOINTS.CHAMPIONSHIPS.GET);
  }

  async getById(id: number): Promise<Championships> {
    return this.baseClient.get<Championships>(
      ENDPOINTS.CHAMPIONSHIPS.GET_ID(id)
    );
  }
}

export const championshipsApiService = ChampionShipApiService.getInstance();
