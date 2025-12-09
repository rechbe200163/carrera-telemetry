'use server';
import { apiClient } from '@/lib/api-client';
import { FormState } from '../fom.types';
import { ENDPOINTS } from '@/lib/enpoints';
import { updateTag } from 'next/cache';
import { CACHE_KEYS } from '../cache-keys';

export async function createControllerAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    name: String(formData.get('name') ?? ''),
    address: Number(formData.get('controllerAddress') ?? ''),
    icon: String(formData.get('icon') ?? ''),
    notes: String(formData.get('notes') ?? ''),
  };

  console.log(JSON.stringify(payload, null, 2));

  updateTag(CACHE_KEYS.controllers);
  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.CONTROLLERS.POST,
    payload
  );
}

export async function updateControllerAction(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const payload: Record<string, unknown> = {};

  const name = formData.get('name');
  if (name) payload.name = String(name);

  const address = formData.get('address');
  if (address) payload.address = Number(address);

  const iconColor = formData.get('iconColor');
  if (iconColor) payload.icon = String(iconColor);

  const notes = formData.get('notes');
  if (notes) payload.notes = String(notes);

  console.log('PATCH PAYLOAD:', JSON.stringify(payload, null, 2));

  updateTag(CACHE_KEYS.controllers);
  return apiClient.safePatch<any, typeof payload>(
    ENDPOINTS.CONTROLLERS.PATCH(id),
    payload
  );
}

export async function deleteControllerAction(
  id: number,
  _prevState: FormState
) {
  updateTag(CACHE_KEYS.controllers);
  return apiClient.safeDelete(ENDPOINTS.CONTROLLERS.DELETE(id));
}
