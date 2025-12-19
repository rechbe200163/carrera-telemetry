'use server';
import { updateTag } from 'next/cache';
import { apiClient } from '../api-client';
import { ENDPOINTS } from '../endpoints';
import { FormState } from '../fom.types';
import { SessionType } from '../types';
import { CACHE_KEYS } from '../cache-keys';
import { redirect } from 'next/navigation';

export async function startSessionAction(
  sessionId: number,
  sessionType: SessionType,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const isRace = sessionType === 'RACE';

  const durationRaw = formData.get('durationMinutes');
  const lapLimitRaw = formData.get('lapLimit');

  const payload: {
    durationMinutes?: number;
    lapLimit?: number;
  } = {};

  console.log(sessionType);

  if (isRace) {
    if (lapLimitRaw) {
      payload.lapLimit = Number(lapLimitRaw);
      console.log(lapLimitRaw);
    }
  } else {
    if (durationRaw) {
      payload.durationMinutes = Number(durationRaw);
      console.log(durationRaw);
    }
  }

  console.log('[Sessions] start payload', {
    sessionId,
    sessionType,
    payload,
  });

  const resp = await apiClient.safePost<any, typeof payload>(
    ENDPOINTS.SESSIONS.START(sessionId),
    payload
  );
  if (resp.success) {
    updateTag(CACHE_KEYS.session(sessionId));
    redirect(`/sessions/${sessionId}/live`);
  }
  return resp;
}
