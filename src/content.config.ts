/**
 * Content Collections — Astro 6.1 syntax
 * Datum: 2026-04-29
 *
 * BREAKING CHANGE z Astro 5:
 *   - Místo `type: 'content'` se používá `loader: glob({...})`
 *   - Místo `import { z } from 'astro:content'` se používá `import { z } from 'astro/zod'`
 *   - Slug se mění na `id`
 *
 * Kolekce:
 *   - pages: statické stránky (per jazyk)
 *   - news: novinky/blog (per jazyk)
 *   - factions: strukturovaná data o armádách (YAML)
 */

import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// ==========================================
// PAGES — markdown stránky uspořádané po jazycích
// src/content/pages/cs/frakce/gondor.md atd.
// ==========================================
const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    lang: z.enum(['cs', 'en', 'de', 'sk', 'uk']),
    meta_description: z.string().max(160).optional(),
    meta_keywords: z.array(z.string()).optional(),
    hero_image: z.string().optional(),
    hero_image_alt: z.string().optional(),
    layout_type: z.enum(['hub', 'detail', 'simple', 'landing']).default('detail'),
    show_toc: z.boolean().default(true),
    show_sidebar: z.boolean().default(true),
    order: z.number().default(0),
    updated: z.date().optional(),
    parent_section: z.string().optional(),
    faction_slug: z.string().optional(),
  }),
});

// ==========================================
// NEWS — novinky/blog ve 4 jazycích
// src/content/news/cs/2026-04-23-slug.md
// ==========================================
const newsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    lang: z.enum(['cs', 'en', 'de', 'sk', 'uk']),
    date: z.date(),
    category: z.enum(['pribeh', 'organizace', 'reporty']),
    author: z.string(),
    featured_image: z.string().optional(),
    featured_image_alt: z.string().optional(),
    excerpt: z.string().max(300),
    tags: z.array(z.string()).default([]),
    published: z.boolean().default(true),
    meta_description: z.string().max(160).optional(),
  }),
});

// ==========================================
// FACTIONS — YAML data o frakcích
// src/content/factions/gondor.yml
// ==========================================
const factionsCollection = defineCollection({
  loader: glob({ pattern: '*.{yml,yaml,json}', base: './src/content/factions' }),
  schema: z.object({
    side: z.enum(['free', 'evil', 'mercenary']),
    i18n: z.object({
      cs: z.object({
        name: z.string(),
        tagline: z.string(),
      }),
      en: z.object({
        name: z.string(),
        tagline: z.string(),
      }).optional(),
      de: z.object({
        name: z.string(),
        tagline: z.string(),
      }).optional(),
      sk: z.object({
        name: z.string(),
        tagline: z.string(),
      }).optional(),
      uk: z.object({
        name: z.string(),
        tagline: z.string(),
      }).optional(),
    }),
    colors: z.array(z.string()),
    emblem: z.string(),
    emblem_image: z.string().optional(),
    difficulty_for_newcomer: z.number().min(1).max(5),
    order: z.number(),
    hero_image: z.string().optional(),
    card_image: z.string().optional(),
    // Praktické / registrační atributy (audit balíky #4 a #5)
    costume_difficulty: z.number().min(1).max(5).optional(),
    roleplay_difficulty: z.number().min(1).max(5).optional(),
    combat_style: z.array(z.string()).optional(),
    recommended_for: z.array(z.string()).optional(),
    not_recommended_for: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    // Doporučení k prvnímu kostýmu (CZ; lokalizaci doplníme přes i18n později)
    newbie_costume_hint: z.string().optional(),
    // Krátký RP/táborový hook pro detail armády (CZ)
    camp_hook: z.string().optional(),
    // Panovník / velitel armády (volitelné — pro 8 hlavních armád, ne pro žoldáky)
    ruler: z.object({
      name: z.string(),
      title: z.string(),
      description: z.string(),
      photo: z.string().optional(),  // base name souboru v /images/panovnici/{photo}.webp
    }).optional(),
    // Převládající barvy oděvu (text — např. "zelená, hnědá, šedá; doplňková žlutá")
    costume_colors_text: z.string().optional(),
    // Výsostné znaky (text — např. "Stříbrný strom se sedmi hvězdami na tmavém poli")
    heraldry_text: z.string().optional(),
    // Dlouhý popis armády — strukturovaný do sekcí (z docx podkladů)
    lore_sections: z.array(z.object({
      title: z.string(),
      paragraphs: z.array(z.string()),
    })).optional(),
  }),
});

// ==========================================
// LONG-FORM PAGES — pro velké legal/info stránky s markdown body
// src/content/pages-long/{slug}/{lang}.md
// Frontmatter: title, description, breadcrumb, hero_subtitle.
// Body = markdown. Renderuje se přes <Content /> z astro:content.
// ==========================================
const longPagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages-long' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    breadcrumb: z.string(),
    hero_subtitle: z.string().optional(),
    show_lang_notice: z.boolean().default(false),
    show_jurisdiction_notice: z.boolean().default(false),
    last_updated: z.string().optional(),
    last_updated_label: z.string().optional(),  // "Poslední aktualizace"
    last_updated_suffix: z.string().optional(), // "Platí pro: web Pán Prstenů 2026"
    toc_title: z.string().optional(),           // "Obsah stránky" / "Cesta nováčka"
    toc_aria: z.string().optional(),
    chapters: z.array(z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string(),
    })).optional(),
  }),
});

export const collections = {
  pages: pagesCollection,
  news: newsCollection,
  factions: factionsCollection,
  longPages: longPagesCollection,
};
