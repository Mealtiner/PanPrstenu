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

export interface GroupOption {
  id: number;
  name: string;
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
  groups: GroupOption[];
  groups_enabled: boolean;
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
  first_name: string;
  age_bucket: '18+' | '18-' | null;
  is_paid: boolean;
  group_id: number | null;
  group_name: string | null;
  form: Record<string, string | null>;
  // self = vlastní reg, affiliated = přidružená osoba (typicky dítě),
  // pending = guest registrace čekající na potvrzení emailem.
  target_type?: 'self' | 'affiliated' | 'pending';
}

export interface ParticipantsResponse {
  event: { slug: string; name: string };
  groupby: string[][];
  participants: Participant[];
  total: number;
}

// === Statistiky ============================================================

export interface StatsSideRow {
  key: string;
  label: string;
  count: number;
  avg_age: number | null;
  male: number;
  female: number;
  unknown_sex: number;
}

export interface StatsNarRow {
  key: string;
  label: string;
  side_key: string;
  count: number;
  avg_age: number | null;
  male: number;
  female: number;
}

export interface StatsRoleRow {
  key: string;
  label: string;
  count: number;
  avg_age: number | null;
}

export interface StatsKidsRow {
  key: string;
  label: string;
  count: number;
}

export interface StatsWeaponRow {
  key: string;
  label: string;
  count: number;
}

export interface StatsWeaponBySide {
  side_key: string;
  side_label: string;
  weapons: StatsWeaponRow[];
  total: number;
}

export interface StatsWeaponByAge {
  key: string;
  label: string;
  buckets: number[];
  total: number;
}

export interface StatsArrival {
  key: string;
  label: string;
  count: number;
  cumulative: number;
}

export interface StatsNarPyramid {
  key: string;
  label: string;
  side_key: string;
  years: number[]; // per-rok počty (index 0 = 0 let, max = open-ended 80+)
}

export interface StatsAgeYears {
  min: number;
  max: number;
  free: number[];
  evil: number[];
  other: number[];
  by_gender: { male: number[]; female: number[] };
}

export interface StatsAgeStats {
  min: number | null;
  max: number | null;
  median: number | null;
  mode: number | null;
  mode_count?: number;
  avg: number | null;
}

export interface StatsTimelinePoint {
  date: string;
  count: number;
  cumulative: number;
}

export interface StatsGroupSizeBucket {
  key: string;
  count: number;
}

export interface StatsLorenzPoint {
  x: number; // % skupin
  y: number; // % lidí
}

export interface StatsGenerations {
  labels: string[];
  keys: string[];
  ranges: string[];
  by_side: { side_key: string; side_label: string; counts: number[] }[];
}

export interface StatsShannonRow {
  side_key: string;
  side_label: string;
  H: number;
  evenness: number;
  S: number;
  n: number;
}

export interface StatsGenderWeaponRow {
  weapon_key: string;
  weapon_label: string;
  male: number;
  female: number;
  col_total: number;
}

export interface StatsGenderWeapon {
  rows: StatsGenderWeaponRow[];
  cramer_v: number | null;
  total: number;
  male_total: number;
  female_total: number;
}

export interface StatsGenderRoleRow {
  role_key: string;
  role_label: string;
  male: number;
  female: number;
  col_total: number;
}

export interface StatsGenderRole {
  rows: StatsGenderRoleRow[];
  cramer_v: number | null;
  total: number;
  male_total: number;
  female_total: number;
}

export interface StatsYoungAdult {
  total: number;
  total_with_age: number;
  percent: number;
  under_18: { count: number; percent: number };
  young_adults: { count: number; percent: number };
  over_25: { count: number; percent: number };
  by_side: { side_key: string; side_label: string; count: number }[];
}

export interface StatsSimpsonGroup {
  group_id: number;
  group_name?: string;
  size: number;
  simpson: number;
}

export interface StatsOutlier {
  age: number;
  side_key: string;
  side_label: string;
}

export interface StatsAgeOutliers {
  youngest: StatsOutlier[];
  oldest: StatsOutlier[];
}

export interface StatsNarBySide {
  side_key: string;
  side_label: string;
  total: number;
  nars: { nar_key: string; nar_label: string; count: number }[];
}

export interface StatsResponse {
  event: { slug: string; name: string; date_from: string };
  total: number;
  age_stats: StatsAgeStats;
  by_side: StatsSideRow[];
  by_nar: StatsNarRow[];
  by_role: StatsRoleRow[];
  by_kids: StatsKidsRow[];
  age_buckets: {
    labels: string[];
    free: number[];
    evil: number[];
    other: number[];
    by_gender: { male: number[]; female: number[] };
  };
  age_years: StatsAgeYears;
  gender: { male: number; female: number; unknown: number };
  by_weapon: StatsWeaponRow[];
  weapon_by_side: StatsWeaponBySide[];
  weapon_by_age: StatsWeaponByAge[];
  arrivals: StatsArrival[];
  nar_pyramid: StatsNarPyramid[];
  timeline: StatsTimelinePoint[];
  group_size_buckets: StatsGroupSizeBucket[];
  group_total_solo: number;
  group_count: number;
  gini_groups: number | null;
  lorenz_groups: StatsLorenzPoint[];
  generations: StatsGenerations;
  shannon: StatsShannonRow[];
  gender_weapon: StatsGenderWeapon;
  gender_role: StatsGenderRole;
  young_adult: StatsYoungAdult;
  simpson_groups: StatsSimpsonGroup[];
  simpson_total: number;
  age_outliers: StatsAgeOutliers;
  nar_by_side: StatsNarBySide[];
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
