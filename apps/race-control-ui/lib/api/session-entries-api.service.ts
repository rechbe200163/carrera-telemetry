// lib/api/session-entries-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { SessionEntries } from '../types';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';

// ------------------------------------------------------
//  GET SESSION ENTRIES BY SESSION ID
// ------------------------------------------------------
export async function getSessionEntriesBySessionId(
  sessionId: number
): Promise<SessionEntries[]> {
  'use cache';
  cacheTag(CACHE_KEYS.sessionEntriesBySession(sessionId));

  return apiClient.get<SessionEntries[]>(
    ENDPOINTS.SESSION_ENTRIES.GET_BY_SESSION_ID(sessionId)
  );
}
