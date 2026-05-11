/**
 * Klient pro registracka.cz API. Vanilla TS, žádné dependencies.
 * Datum: 2026-05-12
 *
 * Defaultní base URL je https://www.registracka.cz/api/v1.
 * Lze přepsat env var PUBLIC_REGISTRACKA_API (např. pro dev/staging).
 */

import type { ApiResponse, CurrentUser, SchemaResponse, ParticipantsResponse, CapacityData } from './types';

const DEFAULT_API_BASE = 'https://www.registracka.cz/api/v1';
const API_BASE: string = (import.meta.env.PUBLIC_REGISTRACKA_API as string | undefined) || DEFAULT_API_BASE;

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    });
    return (await res.json()) as ApiResponse<T>;
  } catch (e) {
    return {
      ok: false,
      error: {
        code: 'network_error',
        message: e instanceof Error ? e.message : 'Spojení se serverem registracka.cz selhalo.',
      },
    };
  }
}

export async function getMe(): Promise<CurrentUser | null> {
  const res = await request<CurrentUser>('/me');
  return res.ok && res.data ? res.data : null;
}

export async function getEventSchema(slug: string): Promise<SchemaResponse | null> {
  const res = await request<SchemaResponse>(`/events/${slug}/schema`);
  return res.ok && res.data ? res.data : null;
}

export async function getEventCapacity(slug: string): Promise<(CapacityData & { event: SchemaResponse['event']; limits: SchemaResponse['limits'] }) | null> {
  const res = await request<CapacityData & { event: SchemaResponse['event']; limits: SchemaResponse['limits'] }>(`/events/${slug}/capacity`);
  return res.ok && res.data ? res.data : null;
}

export async function getEventParticipants(slug: string): Promise<ParticipantsResponse | null> {
  const res = await request<ParticipantsResponse>(`/events/${slug}/participants`);
  return res.ok && res.data ? res.data : null;
}

// Pro debugging — výchozí export struktury aby šlo logovat.
export const REGISTRACKA_API_BASE = API_BASE;
