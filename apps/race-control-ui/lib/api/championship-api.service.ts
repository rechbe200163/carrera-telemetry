'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Championships } from '../types';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../chach-keys';

export async function getAllChampionships(): Promise<Championships[]> {
  'use cache';
  cacheTag(CACHE_KEYS.championships);
  return apiClient.get<Championships[]>(ENDPOINTS.CHAMPIONSHIPS.GET);
}

export async function getChampionshipById(id: number): Promise<Championships> {
  'use cache';
  cacheTag(CACHE_KEYS.championship(id));
  return apiClient.get<Championships>(ENDPOINTS.CHAMPIONSHIPS.GET_ID(id));
}

export async function getChampionshipByMeetingId(
  meetingId: number
): Promise<Championships> {
  'use cache';
  cacheTag(CACHE_KEYS.championshipMeeting(meetingId));
  return apiClient.get<Championships>(
    ENDPOINTS.CHAMPIONSHIPS.MEETING_ID(meetingId)
  );
}
