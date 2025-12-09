'use server';
import { apiClient } from '@/lib/api-client';
import { FormState } from '../fom.types';
import { ENDPOINTS } from '@/lib/enpoints';
import { revalidateTag, updateTag } from 'next/cache';
import { CACHE_KEYS } from '../chach-keys';

export async function createChampionshipAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    name: String(formData.get('name') ?? ''),
    season: Number(formData.get('season') ?? ''),
    planned_meetings: Number(formData.get('plannedMeetings') ?? ''),
  };

  console.log(JSON.stringify(payload, null, 2));

  updateTag(CACHE_KEYS.championships);
  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.CHAMPIONSHIPS.POST,
    payload
  );
}

export async function updateChampionshipAction(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload: Record<string, unknown> = {};

  const name = formData.get('name');
  if (name) payload.first_name = String(name);

  const season = formData.get('season');
  if (season) payload.last_name = Number(season);

  const planned_meetings = formData.get('plannedMeetings');
  if (planned_meetings) payload.planned_meetings = String(planned_meetings);

  updateTag(CACHE_KEYS.championships);
  return apiClient.safePatch<any, typeof payload>(
    ENDPOINTS.CHAMPIONSHIPS.PATCH(id),
    payload
  );
}

export async function deleteChampionshipAction(
  id: number,
  _prevState: FormState
): Promise<FormState> {
  updateTag(CACHE_KEYS.championships);
  return apiClient.safeDelete(ENDPOINTS.CHAMPIONSHIPS.DELETE(id));
}
