// lib/api/session-entries-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { SessionResults } from '../types';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';

// ------------------------------------------------------
//  GET SESSION ENTRIES BY SESSION ID
// ------------------------------------------------------
export async function getSessionResultsBySessionId(
  sessionId: number
): Promise<SessionResults[]> {
  'use cache';
  cacheTag(CACHE_KEYS.sessionResultsById(sessionId));

  return apiClient.get<SessionResults[]>(
    ENDPOINTS.SESSION_RESULTS.GET_ID(sessionId)
  );
}
