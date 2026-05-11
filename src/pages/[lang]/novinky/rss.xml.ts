/**
 * RSS feed pro /novinky/ — generovaný per jazyk.
 * URL: /{lang}/novinky/rss.xml
 *
 * Čerpá z `news` content collection (filtrované per lang, jen published).
 * Datum: 2026-05-11
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import type { Lang } from '@i18n/ui';
import { getTranslation } from '@i18n/ui';

const LANGS: Lang[] = ['cs', 'en', 'de', 'sk', 'uk'];

const LANG_LOCALE: Record<Lang, string> = {
  cs: 'cs-CZ',
  en: 'en-US',
  de: 'de-DE',
  sk: 'sk-SK',
  uk: 'uk-UA',
};

export async function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = async ({ params, site }) => {
  const lang = params.lang as Lang;
  const t = getTranslation(lang);

  // Vyfiltrovat news per jazyk (folder cs/, en/, ...) + jen published.
  const allNews = await getCollection('news', (entry) =>
    entry.id.startsWith(`${lang}/`) && entry.data.published !== false,
  );

  // Setřídit DESC podle data
  const items = allNews
    .map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.excerpt,
      // Slug bez lang prefixu (např. "2026-05-10-spustili-jsme-novy-web")
      link: `/${lang}/novinky/${entry.id.replace(/^[a-z]{2}\//, '').replace(/\.mdx?$/, '')}/`,
      categories: entry.data.tags,
      author: entry.data.author,
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `Pán Prstenů — ${t('nav.news')}`,
    description: t('site.description'),
    site: site ?? 'https://www.panprstenu.cz',
    items,
    customData: `<language>${LANG_LOCALE[lang]}</language>`,
    stylesheet: false,
  });
};
