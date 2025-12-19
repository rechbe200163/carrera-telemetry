// lib/api/driver-standings-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../endpoints';
import { DriverStandings, LeaderBoard } from '../types';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';

// ------------------------------------------------------
//  GET STANDINGS BY CHAMPIONSHIP
// ------------------------------------------------------
export async function getDriverStandingsByChampionship(
  championshipId: number
): Promise<LeaderBoard[]> {
  'use cache';
  cacheTag(CACHE_KEYS.driverStandingsByChampionship(championshipId));

  return apiClient.get<LeaderBoard[]>(
    ENDPOINTS.DRIVER_STANDINGS.GET_BY_CHAMPIONSHIP_ID(championshipId)
  );
}

// ------------------------------------------------------
//  GET ALL DRIVER STANDINGS (falls du eine Übersicht hast)
// ------------------------------------------------------
export async function getAllDriverStandings(): Promise<DriverStandings[]> {
  'use cache';
  cacheTag(CACHE_KEYS.driverStandings);

  return apiClient.get<DriverStandings[]>(ENDPOINTS.DRIVER_STANDINGS.GET);
}

// ------------------------------------------------------
//  GET SINGLE DRIVER STANDING BY ID
// ------------------------------------------------------
export async function getDriverStandingById(
  id: number
): Promise<DriverStandings> {
  'use cache';
  cacheTag(CACHE_KEYS.driverStanding(id));

  return apiClient.get<DriverStandings>(ENDPOINTS.DRIVER_STANDINGS.GET_ID(id));
}
