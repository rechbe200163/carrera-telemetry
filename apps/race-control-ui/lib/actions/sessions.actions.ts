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
    {
      body: payload,
    }
  );
  if (resp.success) {
    updateTag(CACHE_KEYS.session(sessionId));
    redirect(`/sessions/${sessionId}/live`);
  }
  return resp;
}

export async function addSessionAction(
  meetingId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const isFun = formData.get('sessionType') === SessionType.FUN;
  const sessionType = formData.get('sessionType') as SessionType;
  const name = formData.get('name') as string;
  if (!isFun) {
    return {
      success: false,
      message: 'Only FUN sessions can be added via this form.',
      errors: { title: ['not allowed SessionType for this action'] },
    };
  }

  const payload: {
    durationMinutes?: null;
    lapLimit?: null;
    meetingId: number;
    name: string;
    sessionType: SessionType;
  } = {
    lapLimit: null,
    durationMinutes: null,
    meetingId: meetingId,
    name: name,
    sessionType: sessionType,
  };

  console.log(payload);

  const resp = await apiClient.safePost<any, typeof payload>(
    ENDPOINTS.SESSIONS.POST,
    { body: payload }
  );
  if (resp.success) {
    updateTag(CACHE_KEYS.sessions);
    return {
      success: true,
      message: resp.message,
    };
  }
  return resp;
}

export async function finishSessionAction(
  sessionId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload: {} = {};
  const resp = await apiClient.safePost<any, typeof payload>(
    ENDPOINTS.SESSIONS.FINISH(sessionId),
    {}
  );
  if (resp.success) {
    redirect(`/sessions/${sessionId}/lap-stats`);
  }
  return {
    success: true,
  };
}
