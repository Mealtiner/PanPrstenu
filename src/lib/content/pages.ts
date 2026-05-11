/**
 * Per-page content loader
 * Datum: 2026-05-04 (revize 2026-05-11 — unifikace na getPageData<T>)
 *
 * Načítá strukturovaný obsah stránky z `src/content/pages/{slug}/{lang}.json`.
 * Jeden soubor = jedna jazyková mutace jedné stránky. Tato struktura je
 * CMS-ready: jeden file mapuje na jeden Sveltia/Directus dokument.
 *
 * Použití (preferovaná cesta):
 *   import type { Lang } from '@i18n/ui';
 *   import { getPageData, type PageContent } from '@lib/content/pages';
 *
 *   // Permissive (bez interface):
 *   const p = getPageData<PageContent>('role/organizatori', lang);
 *   <h1>{p.meta.title}</h1>
 *
 *   // Striktně typovaný (lépe pro velké stránky):
 *   interface OrgPage { meta: { title: string }; hero: { h1: string } }
 *   const p = getPageData<OrgPage>('role/organizatori', lang);
 *
 * Fallback: pokud chybí soubor pro daný jazyk, vrátí se cs.json.
 * Pokud chybí i cs.json (typo ve slugu), helper hodí runtime error.
 *
 * Konvence slugu:
 *   /cs/role/organizatori/  → 'role/organizatori'
 *   /cs/                    → '_home'
 *   /404                    → '_root/404'
 *
 * DEPRECATED: getPageContent — odstraněno v 3.4.0 unifikací na getPageData<T>.
 * Pro dotaz string klíče (i s tečkami) použij p['key.with.dots'] nebo p.key.
 */

import type { Lang } from '@i18n/ui';

// eager: true → JSON moduly se inlineují do build outputu
const pageData = import.meta.glob('/src/content/pages/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

/**
 * Permissive content type — pro stránky, které nemají vlastní striktní interface.
 * Klíče: libovolný string, hodnoty: cokoli (string, nested objekt, array).
 * Klíče s tečkami (např. 'quote.text') jsou flat strings v JSONu, přístupné
 * jako p['quote.text']. Hierarchická data jako p.meta.title.
 */
export type PageContent = Record<string, any>;

export function getPageData<T = PageContent>(slug: string, lang: Lang): T {
  const wanted = `/src/content/pages/${slug}/${lang}.json`;
  const fallback = `/src/content/pages/${slug}/cs.json`;
  const data = pageData[wanted] ?? pageData[fallback];
  if (!data) {
    throw new Error(
      `[getPageData] No content found for slug="${slug}". Expected ${wanted} or ${fallback}.`
    );
  }
  return data as T;
}

/**
 * Existuje per-page JSON pro daný slug + lang? (Bez fallbacku.)
 * Použij pro audit / podmíněné renderování.
 */
export function hasPageData(slug: string, lang: Lang): boolean {
  return `/src/content/pages/${slug}/${lang}.json` in pageData;
}

