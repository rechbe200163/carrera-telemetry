'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Championships, Meetings } from '../types';

export class MeetingsApiService {
  private static instance: MeetingsApiService;

  static getInstance(): MeetingsApiService {
    if (!this.instance) {
      this.instance = new MeetingsApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getAllByChampionsshipId(championshipId: number): Promise<Meetings[]> {
    return this.baseClient.get<Meetings[]>(
      ENDPOINTS.MEETINGS.GET_BY_CHAMPIONSHIP_ID(championshipId)
    );
  }

  async getAll(): Promise<Meetings[]> {
    return this.baseClient.get<Meetings[]>(ENDPOINTS.CHAMPIONSHIPS.GET);
  }
  async getById(id: number): Promise<Meetings> {
    return this.baseClient.get<Meetings>(ENDPOINTS.CHAMPIONSHIPS.GET_ID(id));
  }
}

export const meetingsApiService = MeetingsApiService.getInstance();
