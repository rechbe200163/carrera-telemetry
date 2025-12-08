'use server';
import { apiClient } from '../api-client';
import { ENDPOINTS } from '../enpoints';
import { FormState } from '../fom.types';

export async function createSessionEntriesAction(
  sessionId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const driverIdRaw = formData.get('driverId');
  const controllerAddressRaw = formData.get('controllerAddress');
  const carLabelRaw = formData.get('carLabel');

  const payload = {
    driver_id: driverIdRaw ? Number(driverIdRaw) : null,
    controller_address: controllerAddressRaw
      ? Number(controllerAddressRaw)
      : null,
    car_label: carLabelRaw ? String(carLabelRaw) : null,
  };

  // Optional: minimal Logging
  console.log('[SessionEntries] payload', payload);

  return apiClient.safePost<any, typeof payload>(
    ENDPOINTS.SESSION_ENTRIES.POST(sessionId),
    payload
  );
}
