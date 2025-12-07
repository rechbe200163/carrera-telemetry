'use server';
import { apiClient } from '@/lib/api-client';
import { FormState } from '../fom.types';
import { ENDPOINTS } from '@/lib/enpoints';

export async function createMeetingsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    name: String(formData.get('name') ?? ''),
    season: Number(formData.get('season') ?? ''),
    planned_meetings: Number(formData.get('plannedMeetings') ?? ''),
  };

  console.log(JSON.stringify(payload, null, 2));

  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.CHAMPIONSHIPS.POST,
    payload
  );
}
