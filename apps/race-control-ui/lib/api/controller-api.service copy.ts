// lib/api/controller-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Controllers } from '../types';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../chach-keys';

// ------------------------------------------------------
//  GET ALL CONTROLLERS
// ------------------------------------------------------
export async function getAllControllers(): Promise<Controllers[]> {
  'use cache';
  cacheTag(CACHE_KEYS.controllers);

  return apiClient.get<Controllers[]>(ENDPOINTS.CONTROLLERS.GET);
}

// ------------------------------------------------------
//  GET CONTROLLER BY ID
// ------------------------------------------------------
export async function getControllerById(id: number): Promise<Controllers> {
  'use cache';
  cacheTag(CACHE_KEYS.controller(id));

  return apiClient.get<Controllers>(ENDPOINTS.CONTROLLERS.GET_ID(id));
}

// ------------------------------------------------------
//  SEARCH CONTROLLERS (Query)
// ------------------------------------------------------
export async function searchControllers(query: string): Promise<Controllers[]> {
  'use cache';
  cacheTag(`controller-search-${query}`);

  // Falls du später einen richtigen Search-Endpoint baust, nur hier ändern.
  return apiClient.get<Controllers[]>(
    `/drivers?query=${encodeURIComponent(query)}`
  );
}
