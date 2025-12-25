'use server';
import { updateTag } from 'next/cache';
import { apiClient } from '../api-client';
import { CACHE_KEYS } from '../cache-keys';
import { ENDPOINTS } from '../endpoints';
import { FormState } from '../fom.types';
import { Ancizar_Sans } from 'next/font/google';

export async function createMeetingsForChampioshipAction(
  championshipId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawDate = formData.get('date') as string | null;

  const payload = {
    name: String(formData.get('name') ?? ''),
    start_date: rawDate ? new Date(rawDate) : null,
  };

  console.log(payload);

  updateTag(CACHE_KEYS.meetings);
  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.MEETINGS.POST_GEN_CHAMPIONSHIP_MEETINGS(championshipId),
    { body: payload }
  );
}

export async function createMeetingForFunSessionAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawDate = formData.get('date') as string | null;
  const amount = formData.get('amount');
  const payload = {
    name: String(formData.get('name') ?? ''),
    start_date: rawDate ? new Date(rawDate) : null,
  };

  console.log(payload);

  updateTag(CACHE_KEYS.meetings);
  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.MEETINGS.POST_GEN_FUN_MEETINGS,
    { body: payload, query: { amount } }
  );
}
