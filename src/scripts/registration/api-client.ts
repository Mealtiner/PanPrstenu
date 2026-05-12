/**
 * Klient pro registracka.cz API. Vanilla TS, žádné dependencies.
 * Datum: 2026-05-12
 *
 * Defaultní base URL je https://www.registracka.cz/api/v1.
 * Lze přepsat env var PUBLIC_REGISTRACKA_API (např. pro dev/staging).
 */

import type { ApiResponse, ApiError, CurrentUser, SchemaResponse, ParticipantsResponse, CapacityData, StatsResponse } from './types';

const DEFAULT_API_BASE = 'https://www.registracka.cz/api/v1';
const API_BASE: string = (import.meta.env.PUBLIC_REGISTRACKA_API as string | undefined) || DEFAULT_API_BASE;

// Bearer token storage — pro mobile prohlížeče, kde cookies cross-origin
// blokuje ITP (iOS Safari/Chrome). Token přijde po loginu v JSON odpovědi
// a posíláme ho v `Authorization: Bearer <token>` u každého requestu.
const TOKEN_STORAGE_KEY = 'pp_reg_session_token';

export function getSessionToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setSessionToken(token: string): void {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage může selhat v privátním režimu — token se neuloží,
    // následně se uživatel musí znovu přihlásit
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // Timeout — pokud fetch visí déle než 15s, abort a vrať network_error.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  // Authorization Bearer — pokud máme uložený session token (login proběhl),
  // posíláme ho. Backend ho preferuje před cookie session (kvůli mobile ITP).
  const token = getSessionToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  // Pozor na pořadí — `...options` musí jít PŘED `headers`, jinak by jeho
  // `headers` (např. { 'X-CSRF-Token' } u submitRegistration) přepsal náš
  // merged objekt a Authorization by se ztratil.
  const { headers: customHeaders, ...restOptions } = options;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      signal: controller.signal,
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...((customHeaders as Record<string, string> | undefined) ?? {}),
      },
    });
    clearTimeout(timeoutId);
    // Pokus o parse — pokud server vrátí neJSON (např. HTML error page),
    // detailněji to vyřešíme než generický 'network_error'.
    const text = await res.text();
    try {
      return JSON.parse(text) as ApiResponse<T>;
    } catch {
      return {
        ok: false,
        error: {
          code: 'invalid_response',
          message: `Server vrátil ${res.status} ${res.statusText} (non-JSON, ${text.length} B): ${text.slice(0, 100)}`,
        },
      };
    }
  } catch (e) {
    clearTimeout(timeoutId);
    const isAbort = e instanceof DOMException && e.name === 'AbortError';
    return {
      ok: false,
      error: {
        code: isAbort ? 'timeout' : 'network_error',
        message: isAbort
          ? 'Spojení trvalo příliš dlouho (15s). Zkus to znovu nebo zkontroluj připojení.'
          : `Chyba spojení: ${e instanceof Error ? e.message : String(e)}`,
      },
    };
  }
}

export async function getMe(): Promise<CurrentUser | null> {
  const res = await request<CurrentUser>('/me');
  return res.ok && res.data ? res.data : null;
}

// Exportuje stav posledního selhání schema fetch (pro UI debug message).
// Vyplněno přes console.log + window.__lastSchemaError pro inspekci na mobile.
export let lastSchemaError: ApiError | null = null;

export async function getEventSchema(slug: string): Promise<SchemaResponse | null> {
  const res = await request<SchemaResponse>(`/events/${slug}/schema`);
  if (res.ok && res.data) {
    lastSchemaError = null;
    return res.data;
  }
  lastSchemaError = res.error ?? { code: 'no_data', message: 'Schema je prázdné.' };
  if (typeof window !== 'undefined') {
    (window as unknown as { __lastSchemaError: ApiError | null }).__lastSchemaError = lastSchemaError;
    // eslint-disable-next-line no-console
    console.error('[reg] getEventSchema failed:', lastSchemaError);
  }
  return null;
}

export async function getEventCapacity(slug: string): Promise<(CapacityData & { event: SchemaResponse['event']; limits: SchemaResponse['limits'] }) | null> {
  const res = await request<CapacityData & { event: SchemaResponse['event']; limits: SchemaResponse['limits'] }>(`/events/${slug}/capacity`);
  return res.ok && res.data ? res.data : null;
}

export async function getEventParticipants(slug: string): Promise<ParticipantsResponse | null> {
  const res = await request<ParticipantsResponse>(`/events/${slug}/participants`);
  return res.ok && res.data ? res.data : null;
}

export async function getEventStats(slug: string): Promise<StatsResponse | null> {
  const res = await request<StatsResponse>(`/events/${slug}/stats`);
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
  session_token: string; // Bearer token pro mobile (cross-origin bez cookies)
}

// Přihlásí uživatele přes API. Při úspěchu uloží session_token do localStorage —
// následující requesty se autentizují přes Authorization: Bearer (cross-origin
// bez cookies). Cookie session zůstává jako záloha pro same-origin.
export async function login(email: string, password: string): Promise<ApiResponse<LoginResult>> {
  const res = await request<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.ok && res.data?.session_token) {
    setSessionToken(res.data.session_token);
  }
  return res;
}

export async function logout(): Promise<ApiResponse<{ logged_out: boolean }>> {
  const res = await request<{ logged_out: boolean }>('/auth/logout', {
    method: 'POST',
  });
  // Vždy vyčistíme lokální token, i kdyby server logout selhal —
  // jinak by uživatel zůstal "přihlášený" na klientovi.
  setSessionToken('');
  return res;
}

// === Guest registrace (Fáze 5) ============================================

export interface GuestRegisterPayload {
  email: string;
  password: string;
  personal: Record<string, string>; // firstname, lastname, nick, birth, adress, city, zipcode, state
  form: Record<string, string>;
  agreements: string[];
  group: { id: string; name: string };
  honeypot: string; // skrytý anti-spam field — musí zůstat prázdný
  lang: 'cs' | 'en' | 'de' | 'sk' | 'uk'; // pro lokalizaci confirmation mailu
}

export interface GuestRegisterResult {
  email_sent: boolean;
  email: string;
  message: string;
}

// Bez CSRF — guest endpoint nevyžaduje session (uživatel ještě nemá účet).
export async function registerGuest(
  slug: string,
  payload: GuestRegisterPayload,
): Promise<ApiResponse<GuestRegisterResult>> {
  return request<GuestRegisterResult>(`/events/${slug}/register-guest`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Pro debugging — výchozí export struktury aby šlo logovat.
export const REGISTRACKA_API_BASE = API_BASE;
