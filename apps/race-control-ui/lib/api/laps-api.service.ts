// lib/api/laps-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { Laps } from '../types';
import { ENDPOINTS } from '../endpoints';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';

// ------------------------------------------------------
//  GET ALL DRIVERS
// ------------------------------------------------------
export async function getLapBySessionByDriverId(
  sessionId: number,
  driverId: number
): Promise<Laps[]> {
  'use cache';
  cacheTag(CACHE_KEYS.lapsSessionDriver(sessionId, driverId));

  return apiClient.get<Laps[]>(
    ENDPOINTS.LAPS.GET_BY_SESSION_BY_DRIVER(sessionId, driverId)
  );
}
