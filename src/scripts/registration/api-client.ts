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

export interface RegisterPayload {
  form: Record<string, string>;
  agreements: string[];
  group?: { id: string; name: string };
  // Klíč cílové osoby: "self" | "affiliated:<id>" | "group_member:<useridno>:<group_id>"
  target?: string;
}

export interface PaymentStatus {
  due_date: string | null;       // YYYY-MM-DD
  days_remaining: number | null; // záporné = po splatnosti
  is_paid: boolean;
  paid_date: string | null;
}

export interface PaymentComponent {
  registration_id: number;
  target_type: string;
  useridno: number;
  label: string;
  amount: number;
  is_paid: boolean;
  paid_date: string | null;
}

export interface ConsolidatedPayment extends PaymentStatus {
  owner_useridno: number;
  owner_useridno_formatted: string;
  total: number;                    // částka k zaplacení (po případném family cap)
  subtotal_uncapped?: number;       // součet všech komponent bez stropu
  family_cap?: number | null;
  cap_applied?: boolean;
  vs: string;
  bank_account: string;
  iban: string;
  qr_image_html: string;
  components: PaymentComponent[];
}

export interface RegisterResult extends PaymentStatus {
  registration_id: number;
  useridno: number;
  useridno_formatted: string;
  target_type?: 'self' | 'affiliated' | 'group_member';
  status: 'confirmed' | 'pending_orgs_approval';
  price: number;
  price_breakdown: { base: number; surcharges: number; meals: number };
  mail_sent: boolean;
  variable_symbol: string;
  bank_account: string;
  iban: string;
  qr_image_html: string;
  payment?: ConsolidatedPayment;
}

export async function submitRegistration(
  slug: string,
  csrfToken: string,
  payload: RegisterPayload,
): Promise<ApiResponse<RegisterResult>> {
  return request<RegisterResult>(`/events/${slug}/register`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(payload),
  });
}

export interface ExistingRegistration extends PaymentStatus {
  registration_id: number;
  useridno: number;
  useridno_formatted: string;
  target_type?: 'self' | 'affiliated' | 'group_member';
  payment?: ConsolidatedPayment;
  created: string;
  updated: string;
  confirmed: boolean;
  price: number;
  price_breakdown: { base: number; surcharges: number; meals: number };
  variable_symbol: string;
  bank_account: string;
  iban: string;
  qr_image_html: string;
  group_id: number | null;
  group_name: string | null;
  form: Record<string, string | null>;
  agreements: string[];
}

// Vrátí existující registraci nebo null (404 nebo neauth → null).
export async function getMyRegistration(slug: string): Promise<ExistingRegistration | null> {
  const res = await request<ExistingRegistration>(`/me/registration/${slug}`);
  return res.ok && res.data ? res.data : null;
}

// Cílová osoba pro registraci (self, affiliated, group_member).
export interface MyTarget {
  target_type: 'self' | 'affiliated' | 'group_member';
  target_id: number;
  target_key: string;
  label: string;
  first_name: string;
  last_name: string;
  nick: string;
  birth_date: string;
  state: string;
  email?: string;
  useridno_formatted?: string; // jen pro group_member (jejich vlastní ID)
  group_id?: number;
  group_name?: string;
  registered: boolean;
  registration: {
    registration_id: number;
    useridno_formatted: string;
    created: string;
    confirmed: boolean;
    price: number;
    price_breakdown: { base: number; surcharges: number; meals: number };
    variable_symbol: string;
    bank_account: string;
    iban: string;
    due_date: string | null;
    days_remaining: number | null;
    is_paid: boolean;
    paid_date: string | null;
    form_data: Record<string, string | null>;
  } | null;
}

export interface MyTargetsResponse {
  event: { slug: string; name: string };
  targets: MyTarget[];
}

export async function getMyTargets(slug: string): Promise<MyTargetsResponse | null> {
  const res = await request<MyTargetsResponse>(`/events/${slug}/my-targets`);
  return res.ok && res.data ? res.data : null;
}

// Odregistrovat targetu (self nebo affiliated). Funguje jen pokud není zaplaceno.
export async function unregisterTarget(
  slug: string,
  csrfToken: string,
  targetKey: string,
): Promise<ApiResponse<{ deleted_id: number; target_useridno: number }>> {
  return request<{ deleted_id: number; target_useridno: number }>(`/events/${slug}/unregister`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify({ target: targetKey }),
  });
}

export interface LoginResult {
  useridno: number;
  username: string;
  first_name: string;
  last_name: string;
  nick: string;
  csrf_token: string;
}

// Přihlásí uživatele přes API. Vrací ApiResponse — frontend ho zobrazí přesně.
export async function login(email: string, password: string): Promise<ApiResponse<LoginResult>> {
  return request<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<ApiResponse<{ logged_out: boolean }>> {
  return request<{ logged_out: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

// Pro debugging — výchozí export struktury aby šlo logovat.
export const REGISTRACKA_API_BASE = API_BASE;
