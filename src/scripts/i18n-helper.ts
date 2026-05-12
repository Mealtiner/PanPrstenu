/**
 * i18n helper pro client-side TS skripty.
 * Datum: 2026-05-12
 *
 * Astro `<script>` bloky nemají přímý přístup k `Astro.params.lang`. Strategy:
 *   1) Astro stránka přidá `data-lang={lang}` na root container (např.
 *      <main data-lang={lang}> nebo na shellu s dynamickým obsahem)
 *   2) Klient: getLangFromDom() přečte hodnotu z prvního elementu [data-lang]
 *   3) Fallback: parse z URL /<lang>/  →  detect 'cs'|'en'|'de'|'sk'|'uk'
 *
 * Použití v TS skriptu:
 *   import { getDomTranslator } from '@scripts/i18n-helper';
 *   const t = getDomTranslator();
 *   element.textContent = t('loading.stats');
 */

import { getTranslation, type Lang } from '@i18n/ui';

const LANGS: readonly Lang[] = ['cs', 'en', 'de', 'sk', 'uk'];

export function getLangFromDom(): Lang {
  if (typeof document === 'undefined') return 'cs';

  // Priorita 1: data-lang attribute na nejbližším elementu (typicky <main data-lang="en">
  // nebo na rootu dynamického obsahu jako <div id="statistiky-app" data-lang="en">)
  const root = document.querySelector<HTMLElement>('[data-lang]');
  if (root?.dataset.lang && (LANGS as readonly string[]).includes(root.dataset.lang)) {
    return root.dataset.lang as Lang;
  }

  // Priorita 2: z URL prefixu — `/(cs|en|de|sk|uk)/...`
  if (typeof window !== 'undefined') {
    const m = /^\/(cs|en|de|sk|uk)\//.exec(window.location.pathname);
    if (m?.[1]) return m[1] as Lang;
  }

  return 'cs';
}

export function getDomTranslator(): ReturnType<typeof getTranslation> {
  return getTranslation(getLangFromDom());
}
