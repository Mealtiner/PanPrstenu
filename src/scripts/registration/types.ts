/**
 * TS typy pro registrační API (registracka.cz).
 * Datum: 2026-05-12
 *
 * Tyto typy odpovídají response strukturám z PHP API.
 * Drž je v synchron s /Registračka/api/v1/events/*.php.
 */

export type FieldType = 'options' | 'select' | 'text' | 'longtext' | 'number' | 'date' | 'info';

export interface FormField {
  type: FieldType;
  name?: string;
  label?: string;
  value?: string;
  options?: Record<string, string>;
  limit?: Record<string, number>;
  optionsif?: Record<string, string[]>;
  if?: string[];
  required?: boolean;
  note?: string;
  min?: number;
  max?: number;
  start?: boolean;
}

export interface PersonalFieldDef {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select';
  ref_in_db: string;
  options?: Record<string, string>;
}

export interface Agreement {
  key: string;
  label: string;
  required: boolean;
  text?: string;
  url?: string;
}

export interface EventMeta {
  slug: string;
  name: string;
  registration_open: boolean;
  date_from: string | null;
  date_to: string | null;
  termin: string | null;
  contact_email?: string;
}

export interface CapacityData {
  total: number;
  // Po PHP force-cast `(object)` je každá podstruktura vždy objekt (i prázdný {}).
  by_field: Record<string, Record<string, number>>;
}

export interface SchemaResponse {
  event: EventMeta;
  personal: {
    info_html: string;
    required_fields: string[];
    fields_def: PersonalFieldDef[];
  };
  payment_choice_enabled: boolean;
  form: {
    info_html: string;
    fields: FormField[];
  };
  agreements: Agreement[];
  capacity: CapacityData;
  limits: Record<string, Record<string, number>>;
}

export interface AssociatedPerson {
  id: number;
  first_name: string;
  last_name: string;
  nick: string;
  birth_date: string;
  sex: string;
}

export interface CurrentUser {
  useridno: number;
  username: string;
  first_name: string;
  last_name: string;
  nick: string;
  birth: string | null;
  role: number;
  gdpr_accepted: boolean;
  gdpr_date: string | null;
  csrf_token: string;
  associated_persons: AssociatedPerson[];
}

export interface Participant {
  useridno: number;
  nick: string;
  group_id: number | null;
  group_name: string | null;
  form: Record<string, string | null>;
}

export interface ParticipantsResponse {
  event: { slug: string; name: string };
  groupby: string[][];
  participants: Participant[];
  total: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
  meta?: { updated_at: string };
}
