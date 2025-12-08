'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Sessions } from '../types';

export class SessionsApiService {
  private static instance: SessionsApiService;

  static getInstance(): SessionsApiService {
    if (!this.instance) {
      this.instance = new SessionsApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getAll(): Promise<Sessions[]> {
    return this.baseClient.get<Sessions[]>(ENDPOINTS.SESSIONS.GET);
  }

  async getById(id: number): Promise<Sessions> {
    return this.baseClient.get<Sessions>(ENDPOINTS.SESSIONS.GET_ID(id));
  }

  async getByMeetingId(meetingId: number): Promise<Sessions[]> {
    return this.baseClient.get<Sessions[]>(
      ENDPOINTS.SESSIONS.GET_BY_MEETING_ID(meetingId)
    );
  }
}

export const sessionsApiService = SessionsApiService.getInstance();
