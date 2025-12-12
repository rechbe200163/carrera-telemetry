'use server';

import { updateTag } from 'next/cache';
import { apiClient } from '../api-client';
import { ENDPOINTS } from '../enpoints';
import { FormState } from '../fom.types';
import { CACHE_KEYS } from '../cache-keys';

export async function rebuildSessionResultsAction(
  sessionId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    sessionId: sessionId,
  };

  console.log(JSON.stringify(payload, null, 2));
  updateTag(CACHE_KEYS.sessionResultsById(sessionId));
  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.SESSION_RESULTS.RENEW(sessionId),
    payload
  );
}
