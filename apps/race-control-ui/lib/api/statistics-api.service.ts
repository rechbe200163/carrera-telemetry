// lib/api/session-entries-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';
import { LapsComparisonResponse } from '../types';

// ------------------------------------------------------
//  GET SESSION ENTRIES BY SESSION ID
// ------------------------------------------------------
export async function getLapsForSessionStat(
  sessionId: number
): Promise<LapsComparisonResponse> {
  'use cache';
  cacheTag(CACHE_KEYS.statsBySessionEveryLap(sessionId));

  return apiClient.get<LapsComparisonResponse>(
    ENDPOINTS.STATISTICS.GET_LAPS_FOR_ALL_DRIVERS_BY_SESSION(sessionId)
  );
}
