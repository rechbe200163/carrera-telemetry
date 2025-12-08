'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { SessionEntries, Sessions } from '../types';

export class SessionsEntriesApiService {
  private static instance: SessionsEntriesApiService;

  static getInstance(): SessionsEntriesApiService {
    if (!this.instance) {
      this.instance = new SessionsEntriesApiService();
    }
    return this.instance;
  }

  private constructor(private readonly baseClient = apiClient) {}

  async getBySessionId(sessionId: number): Promise<SessionEntries[]> {
    return this.baseClient.get<SessionEntries[]>(
      ENDPOINTS.SESSION_ENTRIES.GET_BY_SESSION_ID(sessionId)
    );
  }
}

export const sessionsEntriesApiService =
  SessionsEntriesApiService.getInstance();
