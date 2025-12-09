// lib/api/sessions-api.service.ts
'server-only';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '../enpoints';
import { Sessions } from '../types';
import { cacheTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';

// ------------------------------------------------------
//  GET ALL SESSIONS
// ------------------------------------------------------
export async function getAllSessions(): Promise<Sessions[]> {
  'use cache';
  cacheTag(CACHE_KEYS.sessions);

  return apiClient.get<Sessions[]>(ENDPOINTS.SESSIONS.GET);
}

// ------------------------------------------------------
//  GET SESSION BY ID
// ------------------------------------------------------
export async function getSessionById(id: number): Promise<Sessions> {
  'use cache';
  cacheTag(CACHE_KEYS.session(id));

  return apiClient.get<Sessions>(ENDPOINTS.SESSIONS.GET_ID(id));
}

// ------------------------------------------------------
//  GET SESSIONS BY MEETING ID
// ------------------------------------------------------
export async function getSessionsByMeetingId(
  meetingId: number
): Promise<Sessions[]> {
  'use cache';
  cacheTag(CACHE_KEYS.sessionsByMeeting(meetingId));

  return apiClient.get<Sessions[]>(
    ENDPOINTS.SESSIONS.GET_BY_MEETING_ID(meetingId)
  );
}
