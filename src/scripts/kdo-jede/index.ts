/**
 * Kdo jede — hydrator pro veřejnou stránku /<lang>/kdo-jede/.
 * Datum: 2026-05-15
 *
 * Pro každou kartu armády / role na stránce:
 *   - dopočítá počet přihlášených a aktuální limit z API registracka.cz,
 *   - vyplní (XX/XX) v rámečku karty,
 *   - na tlačítko „Zobraz přihlášené" pověsí otevření modálu se seznamem.
 *
 * Privacy: ukazujeme jen nick (případně křestní jméno) + skupinu,
 * žádné stavy plateb, věk, kontakt. (Per CLAUDE.md / GDPR.)
 */
import {
  getEventSchema,
  getEventParticipants,
} from '../registration/api-client';
import type { Participant, SchemaResponse, FormField } from '../registration/types';
import { getDomTranslator } from '../i18n-helper';
import { openParticipantsModal } from '../participants-modal';

const EVENT_SLUG = 'PP2026';

/** Mapování slug armády (z content/factions) → numerický klíč `nar` v API. */
const FACTION_SLUG_TO_NAR: Record<string, { side: string; nar: string }> = {
  gondor:    { side: '1', nar: '1' },
  rohan:     { side: '1', nar: '2' },
  elfove:    { side: '1', nar: '3' },
  trpaslici: { side: '1', nar: '4' },
  skreti:    { side: '2', nar: '5' },
  skuruti:   { side: '2', nar: '6' },
  harad:     { side: '2', nar: '7' },
  umbar:     { side: '2', nar: '8' },
};

/** Mapování slug role z `otherRoles` → filtr v API. */
const ROLE_SLUG_TO_FILTER: Record<string, { side: string; supporter_category?: string }> = {
  'nebojovy-doprovod':         { side: '4', supporter_category: '2' },
  'fotografove-a-kameramani':  { side: '4', supporter_category: '3' },
  'stankari':                  { side: '4', supporter_category: '4' },
  'pomocnici':                 { side: '4', supporter_category: '6' },
  'organizatori':              { side: '4', supporter_category: '7' },
  'detska-hra':                { side: '5' },
};

export async function initKdoJede(): Promise<void> {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-kj-card]'));
  if (cards.length === 0) return;

  const tr = getDomTranslator();
  const [schema, participantsRes] = await Promise.all([
    getEventSchema(EVENT_SLUG),
    getEventParticipants(EVENT_SLUG),
  ]);

  if (!schema || !participantsRes) {
    for (const card of cards) {
      const countEl = card.querySelector<HTMLElement>('[data-kj-count]');
      const btn = card.querySelector<HTMLElement>('[data-kj-show]');
      if (countEl) countEl.textContent = tr('kdojede.load_failed_short');
      if (btn) {
        btn.setAttribute('disabled', 'true');
        btn.setAttribute('aria-disabled', 'true');
        btn.textContent = tr('kdojede.load_failed_btn');
      }
    }
    return;
  }

  const participants = participantsRes.participants;

  for (const card of cards) {
    const filter = readCardFilter(card);
    if (!filter) continue;

    const matched = filterParticipants(participants, filter);
    const limit = computeLimit(schema, filter);

    const countEl = card.querySelector<HTMLElement>('[data-kj-count]');
    const limitEl = card.querySelector<HTMLElement>('[data-kj-limit]');
    if (countEl) countEl.textContent = String(matched.length);
    if (limitEl) limitEl.textContent = limit !== null ? String(limit) : '∞';

    const btn = card.querySelector<HTMLButtonElement>('[data-kj-show]');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openParticipantsModal({
          title: card.dataset.kjTitle ?? '',
          count: matched.length,
          limit,
          participants: matched,
          tone: card.dataset.kjTone ?? 'gold',
        });
      });
    }
  }
}

interface CardFilter {
  side: string;
  nar?: string;
  supporter_category?: string;
}

function readCardFilter(card: HTMLElement): CardFilter | null {
  const factionSlug = card.dataset.kjFactionSlug;
  const roleSlug = card.dataset.kjRoleSlug;
  if (factionSlug && FACTION_SLUG_TO_NAR[factionSlug]) {
    return FACTION_SLUG_TO_NAR[factionSlug];
  }
  if (roleSlug && ROLE_SLUG_TO_FILTER[roleSlug]) {
    return ROLE_SLUG_TO_FILTER[roleSlug];
  }
  return null;
}

function filterParticipants(participants: Participant[], filter: CardFilter): Participant[] {
  return participants.filter((p) => {
    if (p.form.side !== filter.side) return false;
    if (filter.nar !== undefined && p.form.nar !== filter.nar) return false;
    if (filter.supporter_category !== undefined && p.form.supporter_category !== filter.supporter_category) return false;
    return true;
  });
}

function computeLimit(schema: SchemaResponse, filter: CardFilter): number | null {
  if (filter.nar !== undefined) {
    return getFieldLimit(findField(schema, 'nar'), filter.nar);
  }
  if (filter.supporter_category !== undefined) {
    return getFieldLimit(findField(schema, 'supporter_category'), filter.supporter_category);
  }
  return getFieldLimit(findField(schema, 'side'), filter.side);
}

function findField(schema: SchemaResponse, name: string): FormField | null {
  return schema.form.fields.find((f) => f.name === name) ?? null;
}

function getFieldLimit(field: FormField | null, key: string): number | null {
  if (!field || !field.limit) return null;
  const raw = (field.limit as Record<string, unknown>)[key];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  }
  if (Array.isArray(raw) && typeof raw[0] === 'number') return raw[0];
  return null;
}

// Modal je teď ve sdíleném modulu @scripts/participants-modal (používá ho
// i renderCelkovy na /<lang>/registrace/vypisy/celkovy/).
