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
 *   - factions: strukturovaná data o frakcích (YAML)
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
    lang: z.enum(['cs', 'en', 'de', 'sk']),
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
    lang: z.enum(['cs', 'en', 'de', 'sk']),
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
    side: z.enum(['free', 'evil']),
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
    }),
    colors: z.array(z.string()),
    emblem: z.string(),
    emblem_image: z.string().optional(),
    difficulty_for_newcomer: z.number().min(1).max(5),
    order: z.number(),
    hero_image: z.string().optional(),
    card_image: z.string().optional(),
  }),
});

export const collections = {
  pages: pagesCollection,
  news: newsCollection,
  factions: factionsCollection,
};
