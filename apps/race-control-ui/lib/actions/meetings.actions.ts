'use server';
import { apiClient } from '../api-client';
import { ENDPOINTS } from '../enpoints';
import { FormState } from '../fom.types';

export async function createMeetingsAction(
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

  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.MEETINGS.POST_GEN_NEXT_MEETING(championshipId),
    payload
  );
}
