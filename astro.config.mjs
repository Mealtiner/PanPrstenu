// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import remarkHeadingId from 'remark-heading-id';

/**
 * Skryté frakce (`hidden: true` v YAML) — čteme přímo ze zdroje, aby se
 * seznam nemusel udržovat na dvou místech. Stránka zůstává dostupná přímým
 * odkazem, ale nese `noindex` a nesmí být v sitemapě.
 * Datum: 2026-08-14
 */
const hiddenFactionSlugs = (() => {
  try {
    const dir = fileURLToPath(new URL('./src/content/factions', import.meta.url));
    return readdirSync(dir)
      .filter((f) => /\.ya?ml$/.test(f))
      .filter((f) => /^hidden:\s*true\s*$/m.test(readFileSync(new URL(`./src/content/factions/${f}`, import.meta.url), 'utf8')))
      .map((f) => f.replace(/\.ya?ml$/, ''));
  } catch {
    return ['skuruti']; // fallback — kdyby čtení selhalo, ať se neindexuje aspoň známá skrytá frakce
  }
})();

/**
 * Cesty, které mají v HTML `<meta name="robots" content="noindex">`.
 * Musí být VYLOUČENÉ ze sitemapy, jinak Search Console hlásí
 * „Odeslaná adresa URL označená jako noindex" a Google ztrácí důvěru
 * v celou sitemapu (crawl budget jde na stránky, které nechceme).
 *
 * Patří sem:
 *   - error stránky (403/404/500) — vrací nestandardní HTTP stav,
 *   - `/` — meta-refresh redirect na `/cs/` (viz src/pages/index.astro),
 *   - redirect stuby `/registrace/formular/`, `/registrace/statistiky/*`,
 *   - živé výpisy registrace (`/registrace/vypisy/*`, `/registrace/osobni-karta/`)
 *     — obsah se plní z API, pro index nemá hodnotu a mění se každou hodinu,
 *   - skryté frakce (viz `hiddenFactionSlugs`).
 */
const NOINDEX_PATTERNS = [
  /\/(403|404|500)\/?$/,
  /\/registrace\/formular\/?$/,
  /\/registrace\/osobni-karta\/?$/,
  /\/registrace\/statistiky(\/.*)?$/,
  /\/registrace\/vypisy(\/.*)?$/,
];

/**
 * Astro 6.1 konfigurace — Pán Prstenů
 * Datum: 2026-04-29
 *
 * Stack:
 *   - Astro 6.1.x (statický generátor, Vite 7, Zod 4)
 *   - Tailwind CSS 4.2.x (přes Vite plugin)
 *   - astro-icon 1.1.x (Lucide + Game Icons)
 *   - @astrojs/mdx 5.0.x (markdown s komponenty)
 *   - @astrojs/sitemap 3.7.x (multi-language sitemap)
 *   - i18n: 4 jazyky, výchozí cs s prefixem /cs/
 *
 * Bez Svelte/React — vše statické, žádné peer dependency konflikty.
 */
export default defineConfig({
  site: 'https://www.panprstenu.cz',
  output: 'static',

  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },

  // Image optimalizace přes Sharp (default v Astro 6)
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },

  // Internationalization
  // V Astro 6 změna defaultu redirectToDefaultLocale — nastavíme explicitně.
  i18n: {
    defaultLocale: 'cs',
    locales: ['cs', 'en', 'de', 'sk', 'uk'],
    routing: {
      prefixDefaultLocale: true,
      // Vypnuto: Astro by jinak přepsalo /index.html vlastním
      // 2-sec meta-refresh redirectem. Místo toho server-side
      // přesměrování přes public/.htaccess (Apache RewriteRule)
      // a fallback custom index.astro s 0-sec redirectem.
      redirectToDefaultLocale: false,
    },
    fallback: {
      sk: 'cs',
      en: 'cs',
      de: 'cs',
      uk: 'cs',
    },
  },

  integrations: [
    icon({
      include: {
        lucide: ['*'],
        'game-icons': ['*'],
        'material-symbols': ['accessibility-new'],
      },
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'cs',
        locales: {
          cs: 'cs-CZ',
          en: 'en-US',
          de: 'de-DE',
          sk: 'sk-SK',
          uk: 'uk-UA',
        },
      },
      changefreq: 'weekly',
      priority: 0.7,
      /**
       * Sitemap smí obsahovat POUZE indexovatelné stránky.
       * `page` je absolutní URL (např. https://www.panprstenu.cz/cs/faq/).
       * Datum revize: 2026-08-14
       */
      filter: (page) => {
        // Root `/` je meta-refresh redirect na `/cs/` a nese noindex.
        if (page === 'https://www.panprstenu.cz/') return false;
        if (NOINDEX_PATTERNS.some((re) => re.test(page))) return false;
        if (hiddenFactionSlugs.some((slug) => new RegExp(`/frakce/${slug}/?$`).test(page))) return false;
        return true;
      },
    }),
  ],

  /**
   * Markdown — interpretuje `## Nadpis {#anchor}` syntax (Pandoc/Obsidian)
   * jako `<h2 id="anchor">Nadpis</h2>`. Bez tohoto pluginu by `{#anchor}`
   * zůstal viditelný v textu nadpisu a auto-slug id by neodpovídalo
   * TocSidebar (pro-novacky, podminky-ucasti-a-registrace, …).
   */
  markdown: {
    remarkPlugins: [remarkHeadingId],
  },

  // Vite konfigurace — Tailwind 4 jako Vite plugin
  vite: {
    plugins: [tailwindcss()],
  },
});
