import { FormState } from './fom.types';

// lib/api-client.ts
const BASE_URL = process.env.API_URL ?? 'http://localhost';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

export class ApiClient {
  constructor(private baseUrl: string = BASE_URL) {}

  // Low-level Request (für Daten-Fetching, Server Components, etc.)
  private async request<TResponse, TBody = unknown>(
    path: string,
    method: string,
    body?: TBody
  ): Promise<TResponse> {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (!resp.ok) {
      let errorBody: any = null;

      try {
        // Versuch, JSON zu lesen (Validation Errors etc.)
        errorBody = await resp.json();
      } catch {
        // ignorieren, wenn der Body kein JSON ist
      }

      const message =
        errorBody?.message ||
        errorBody?.error ||
        `HTTP ${resp.status} (${resp.statusText})`;

      const errors: Record<string, string[]> | undefined =
        errorBody?.errors ?? undefined;

      throw new ApiError(message, resp.status, errors);
    }

    // Kein Content (z. B. 204) → einfach undefined zurückgeben
    if (resp.status === 204) {
      return undefined as TResponse;
    }

    // Wenn kein JSON → ebenfalls undefined (oder du passt es später an)
    const contentType = resp.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return undefined as TResponse;
    }

    return (await resp.json()) as TResponse;
  }

  // ---------------------------
  // Raw HTTP Methoden
  // ---------------------------
  public get<TResponse>(path: string) {
    return this.request<TResponse, void>(path, 'GET');
  }

  public post<TResponse, TBody>(path: string, body: TBody) {
    return this.request<TResponse, TBody>(path, 'POST', body);
  }

  public patch<TResponse, TBody>(path: string, body: TBody) {
    return this.request<TResponse, TBody>(path, 'PATCH', body);
  }

  public delete<TResponse = void>(path: string) {
    return this.request<TResponse, void>(path, 'DELETE');
  }

  // ---------------------------
  // SAFE Methoden → immer FormState
  // ---------------------------

  public async safePost<TResponse extends { id?: string | number }, TBody>(
    path: string,
    body: TBody
  ): Promise<FormState> {
    try {
      const data = await this.post<TResponse, TBody>(path, body);

      return {
        success: true,
        message: 'OK',
        data: data?.id, // wenn dein Backend eine id zurückgibt
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  public async safeGet<TResponse extends { id?: string | number }>(
    path: string
  ): Promise<FormState> {
    try {
      const data = await this.get<TResponse>(path);

      return {
        success: true,
        message: 'OK',
        data: data?.id, // bei GET z. B. /drivers/:id
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  public async safePatch<TResponse extends { id?: string | number }, TBody>(
    path: string,
    body: TBody
  ): Promise<FormState> {
    try {
      const data = await this.patch<TResponse, TBody>(path, body);

      return {
        success: true,
        message: 'OK',
        data: data?.id,
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  public async safeDelete(path: string): Promise<FormState> {
    try {
      await this.delete(path);

      return {
        success: true,
        message: 'OK',
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  // ---------------------------
  // Fehler-Mapping → immer FormState
  // ---------------------------
  private mapError(err: any): FormState {
    if (err instanceof ApiError) {
      return {
        success: false,
        message: err.message,
        errors: err.errors,
      };
    }

    // technische Fehler (Network, Timeout, etc.)
    return {
      success: false,
      message: 'Interner Fehler – bitte später erneut versuchen.',
    };
  }
}

export const apiClient = new ApiClient();
