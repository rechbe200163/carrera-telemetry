import { apiClient } from '../api-client';
import { ENDPOINTS } from '../enpoints';
import { FormState } from '../fom.types';
import { SessionType } from '../types';

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

  if (isRace) {
    if (lapLimitRaw) {
      payload.lapLimit = Number(lapLimitRaw);
    }
  } else {
    if (durationRaw) {
      payload.durationMinutes = Number(durationRaw);
    }
  }

  console.log('[Sessions] start payload', {
    sessionId,
    sessionType,
    payload,
  });

  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.SESSIONS.START(sessionId),
    payload
  );
}
