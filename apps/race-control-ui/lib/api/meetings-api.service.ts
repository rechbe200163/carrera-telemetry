'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Meetings } from '../types';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';

// ------------------------------------------------------
//  GET ALL MEETINGS OF A CHAMPIONSHIP
// ------------------------------------------------------
export async function getMeetingsByChampionshipId(
  championshipId: number
): Promise<Meetings[]> {
  'use cache';
  cacheTag(CACHE_KEYS.meetingsByChampionship(championshipId));

  return apiClient.get<Meetings[]>(
    ENDPOINTS.MEETINGS.GET_BY_CHAMPIONSHIP_ID(championshipId)
  );
}

// ------------------------------------------------------
//  GET ALL MEETINGS
// ------------------------------------------------------
export async function getAllMeetings(): Promise<Meetings[]> {
  'use cache';
  cacheTag(CACHE_KEYS.meetings);

  return apiClient.get<Meetings[]>(ENDPOINTS.MEETINGS.GET);
}

// ------------------------------------------------------
//  GET MEETING BY ID
// ------------------------------------------------------
export async function getMeetingById(id: number): Promise<Meetings> {
  'use cache';
  cacheTag(CACHE_KEYS.meeting(id));

  return apiClient.get<Meetings>(ENDPOINTS.MEETINGS.GET_ID(id));
}
