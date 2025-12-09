// lib/api/driver-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { Drivers } from '../types';
import { ENDPOINTS } from '../enpoints';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../chach-keys';

// ------------------------------------------------------
//  GET ALL DRIVERS
// ------------------------------------------------------
export async function getAllDrivers(): Promise<Drivers[]> {
  'use cache';
  cacheTag(CACHE_KEYS.drivers);

  return apiClient.get<Drivers[]>(ENDPOINTS.DRIVERS.GET);
}

// ------------------------------------------------------
//  GET DRIVER BY ID
// ------------------------------------------------------
export async function getDriverById(id: number): Promise<Drivers> {
  'use cache';
  cacheTag(CACHE_KEYS.driver(id));

  return apiClient.get<Drivers>(ENDPOINTS.DRIVERS.GET_ID(id));
}

// ------------------------------------------------------
//  GET DRIVER BY CODE (e.g. VER, HAM, NOR)
// ------------------------------------------------------
export async function getDriverByCode(code: string): Promise<Drivers> {
  'use cache';
  cacheTag(`driver-code-${code}`);

  return apiClient.get<Drivers>(
    `/drivers/by-code?code=${encodeURIComponent(code)}`
  );
}

// ------------------------------------------------------
//  SEARCH DRIVERS
// ------------------------------------------------------
export async function searchDrivers(query: string): Promise<Drivers[]> {
  'use cache';
  cacheTag(`drivers-search-${query}`);

  return apiClient.get<Drivers[]>(
    `/drivers?query=${encodeURIComponent(query)}`
  );
}
