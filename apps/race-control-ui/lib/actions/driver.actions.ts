'use server';

import { apiClient } from '@/lib/api-client';
import { FormState } from '../fom.types';

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

  return apiClient.safePost<any, typeof payload>('/drivers', payload);
}

export async function updateDriverAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {};
  console.log(payload);

  return apiClient.safePatch<any, typeof payload>('/drivers', payload);
}
