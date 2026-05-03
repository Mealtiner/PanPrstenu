// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

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
      redirectToDefaultLocale: true,
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
    }),
  ],

  // Vite konfigurace — Tailwind 4 jako Vite plugin
  vite: {
    plugins: [tailwindcss()],
  },
});
