'use server';

import { apiClient } from '@/lib/api-client';
import { FormState } from '../fom.types';
import { ENDPOINTS } from '@/lib/endpoints';
import { CACHE_KEYS } from '../cache-keys';
import { updateTag } from 'next/cache';

export async function createDriverAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    first_name: String(formData.get('firstName') ?? ''),
    last_name: String(formData.get('lastName') ?? ''),
    color: String(formData.get('color') ?? ''),
  };

  console.log(JSON.stringify(payload, null, 2));

  updateTag(CACHE_KEYS.drivers);
  return apiClient.safePost<any, typeof payload>(ENDPOINTS.DRIVERS.GET, {
    body: payload,
  });
}

export async function updateDriverAction(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload: Record<string, unknown> = {};

  const firstName = formData.get('firstName');
  if (firstName) payload.first_name = String(firstName);

  const lastName = formData.get('lastName');
  if (lastName) payload.last_name = String(lastName);

  const color = formData.get('color');
  if (color) payload.color = String(color);

  console.log('PATCH PAYLOAD:', JSON.stringify(payload, null, 2));

  updateTag(CACHE_KEYS.drivers);
  return apiClient.safePatch<any, typeof payload>(
    ENDPOINTS.DRIVERS.PATCH(id),
    payload
  );
}

export async function deleteDriverActiob(id: number, _prevState: FormState) {
  updateTag(CACHE_KEYS.drivers);
  return apiClient.safeDelete(ENDPOINTS.DRIVERS.DELETE(id));
}
