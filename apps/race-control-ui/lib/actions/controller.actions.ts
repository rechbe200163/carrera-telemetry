'use server';
import { apiClient } from '@/lib/api-client';
import { FormState } from '../fom.types';
import { ENDPOINTS } from '@/lib/enpoints';

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
  if (name) payload.first_name = String(name);

  const address = formData.get('address');
  if (address) payload.last_name = Number(address);

  const icon = formData.get('icon');
  if (icon) payload.icon = String(icon);

  const notes = formData.get('notes');
  if (notes) payload.notes = String(notes);

  console.log('PATCH PAYLOAD:', JSON.stringify(payload, null, 2));

  return apiClient.safePatch<any, typeof payload>(
    ENDPOINTS.CONTROLLERS.PATCH(id),
    payload
  );
}

export async function deleteControllerAction(
  id: number,
  _prevState: FormState
) {
  return apiClient.safeDelete(ENDPOINTS.CONTROLLERS.DELETE(id));
}
