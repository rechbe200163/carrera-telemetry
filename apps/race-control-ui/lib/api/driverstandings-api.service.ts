'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import {
  Championships,
  DriverStandings,
  LeaderBoard,
  Meetings,
} from '../types';

export class DriverStandingsApiService {
  private static instance: DriverStandingsApiService;

  static getInstance(): DriverStandingsApiService {
    if (!this.instance) {
      this.instance = new DriverStandingsApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getStandingsByChampionship(
    championshipId: number
  ): Promise<LeaderBoard[]> {
    return this.baseClient.get<LeaderBoard[]>(
      ENDPOINTS.DRIVER_STANDINGS.GET_BY_CHAMPIONSHIP_ID(championshipId)
    );
  }

  async getAll(): Promise<Meetings[]> {
    return this.baseClient.get<Meetings[]>(ENDPOINTS.CHAMPIONSHIPS.GET);
  }

  async getById(id: number): Promise<Meetings> {
    return this.baseClient.get<Meetings>(ENDPOINTS.CHAMPIONSHIPS.GET_ID(id));
  }
}

export const driverStandingsApiService =
  DriverStandingsApiService.getInstance();
