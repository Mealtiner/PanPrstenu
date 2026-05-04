/**
 * Sdílená data o akci Pán Prstenů 2026
 * Datum: 2026-05-03
 *
 * Typed loader pro fakta o akci. Single source of truth uložen v:
 *   - src/content/site/event/meta.json — language-agnostic (datum, GPS, čísla)
 *   - src/content/site/event/{lang}.json — slovní popisy (CS/EN/DE/SK/UK)
 *
 * Použití (i18n-aware):
 *   import { getEvent } from '@data/event';
 *   const event = getEvent(lang);
 *   <p>{event.date_full}</p>
 *
 * Backward-compat (CS only, deprecated — používá se ještě na pár místech):
 *   import { event } from '@data/event';
 */

import meta from '@content/site/event/meta.json';
import csLabels from '@content/site/event/cs.json';
import enLabels from '@content/site/event/en.json';
import deLabels from '@content/site/event/de.json';
import skLabels from '@content/site/event/sk.json';
import ukLabels from '@content/site/event/uk.json';
import type { Lang } from '@i18n/ui';

const labelsByLang = {
  cs: csLabels,
  en: enLabels,
  de: deLabels,
  sk: skLabels,
  uk: ukLabels,
} as const;

export type EventData = typeof meta & typeof csLabels;

export function getEvent(lang: Lang): EventData {
  const labels = labelsByLang[lang] ?? csLabels;
  return { ...meta, ...labels };
}

/**
 * @deprecated — používej `getEvent(lang)`. Tento export drží CS variantu jen pro
 * zpětnou kompatibilitu se zbývajícími místy, která zatím nejsou i18n-aware.
 */
export const event: EventData = getEvent('cs');
