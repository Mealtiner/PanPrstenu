/**
 * Per-page content loader
 * Datum: 2026-05-04
 *
 * Načítá strukturovaný obsah stránky z `src/content/pages/{slug}/{lang}.json`.
 * Jeden soubor = jedna jazyková mutace jedné stránky. Tato struktura je
 * CMS-ready: jeden file mapuje na jeden Sveltia/Directus dokument.
 *
 * Použití:
 *   import type { Lang } from '@i18n/ui';
 *   import { getPageData } from '@lib/content/pages';
 *
 *   interface MyPage { meta: { title: string }; hero: { h1: string } }
 *   const page = getPageData<MyPage>('role/organizatori', lang);
 *   <h1>{page.hero.h1}</h1>
 *
 * Fallback: pokud chybí soubor pro daný jazyk, vrátí se cs.json.
 * Pokud chybí i cs.json (typo ve slugu), helper hodí runtime error.
 *
 * Konvence slugu:
 *   /cs/role/organizatori/  → 'role/organizatori'
 *   /cs/                    → '_home'
 *   /404                    → '_root/404'
 */

import type { Lang } from '@i18n/ui';

// eager: true → JSON moduly se inlineují do build outputu
const pageData = import.meta.glob('/src/content/pages/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export function getPageData<T = Record<string, unknown>>(slug: string, lang: Lang): T {
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
