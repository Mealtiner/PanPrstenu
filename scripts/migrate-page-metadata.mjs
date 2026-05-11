#!/usr/bin/env node
/**
 * migrate-page-metadata.mjs — sjednocení page metadata schématu
 * Datum: 2026-05-11
 *
 * Cíl: zajistit, že každý src/content/pages/<slug>/<lang>.json má
 * kanonický blok `meta: { title, description }` jako prvý klíč.
 *
 * Strategie: ADITIVNÍ migrace — přidáme `meta.title` + `meta.description`,
 * ale NIC neodstraňujeme. Tím nehrozí rozbití existujících .astro stránek,
 * které čtou `tp('meta_title')`, `tp('title')` apod.
 *
 * Zdroj hodnot (v pořadí preference):
 *   title:
 *     1. existující data.meta.title
 *     2. data.meta_title (pattern C)
 *     3. data.hero.h1
 *     4. data.title (pattern D)
 *     5. data.breadcrumb / data.bc_label / data.tag
 *     6. i18n nav.* podle slug (pro pattern E: galerie/novinky/pribeh)
 *     7. slug jako uppercase fallback (poslední záchrana)
 *
 *   description:
 *     1. data.meta.description
 *     2. data.description (top-level)
 *     3. data.meta_description
 *     4. data.hero.subtitle
 *     5. data.subtitle / data.desc
 *     6. fallback z i18n site.description
 *
 * Spuštění:
 *   node scripts/migrate-page-metadata.mjs           # provede migraci
 *   node scripts/migrate-page-metadata.mjs --dry     # jen reportuje, nezapisuje
 *   node scripts/migrate-page-metadata.mjs --report  # jen výpis stavu po skenu
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DRY = process.argv.includes('--dry') || process.argv.includes('--report');
const REPORT_ONLY = process.argv.includes('--report');

const LANGS = ['cs', 'en', 'de', 'sk', 'uk'];

// Mapování slug → klíč v i18n nav.* pro pattern E stránky (bez vlastního title)
const SLUG_TO_NAV_KEY = {
  galerie: 'nav.gallery',
  novinky: 'nav.news',
  pribeh: 'nav.story',
};

const SLUG_TITLE_FALLBACK = {
  galerie: { cs: 'Galerie', en: 'Gallery', de: 'Galerie', sk: 'Galéria', uk: 'Галерея' },
  novinky: { cs: 'Novinky', en: 'News', de: 'Neuigkeiten', sk: 'Novinky', uk: 'Новини' },
  pribeh:  { cs: 'Příběh', en: 'Story', de: 'Geschichte', sk: 'Príbeh', uk: 'Історія' },
};

/* ──────────────────────────────────────────────────────────────────────── */

const recurseFiles = async (dir) => {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...await recurseFiles(full));
    else out.push(full);
  }
  return out;
};

const i18n = {};
for (const l of LANGS) {
  i18n[l] = JSON.parse(await readFile(join(ROOT, 'src/i18n/ui', `${l}.json`), 'utf8'));
}

/* ──────────────────────────────────────────────────────────────────────── */

const resolveTitle = (data, slug, lang) => {
  if (data?.meta?.title) return data.meta.title;
  if (data?.meta_title) return data.meta_title;
  if (data?.hero?.h1) return data.hero.h1;
  if (data?.title) return data.title;
  if (data?.breadcrumb) return data.breadcrumb;
  if (data?.bc_label) return data.bc_label;
  if (data?.tag) return data.tag;
  // Pattern E — slug-based fallback
  const navKey = SLUG_TO_NAV_KEY[slug];
  if (navKey && i18n[lang]?.[navKey]) return i18n[lang][navKey];
  if (SLUG_TITLE_FALLBACK[slug]?.[lang]) return SLUG_TITLE_FALLBACK[slug][lang];
  // Poslední záchrana: derivace ze slugu
  const last = slug.split('/').pop() || slug;
  return last.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const resolveDescription = (data, lang) => {
  if (data?.meta?.description) return data.meta.description;
  if (data?.description && typeof data.description === 'string') return data.description;
  if (data?.meta_description) return data.meta_description;
  if (data?.hero?.subtitle) return data.hero.subtitle;
  if (data?.subtitle && typeof data.subtitle === 'string') return data.subtitle;
  if (data?.desc && typeof data.desc === 'string') return data.desc;
  return i18n[lang]?.['site.description'] ?? '';
};

/* ──────────────────────────────────────────────────────────────────────── */
/* Reordering: zajistí, že `meta` je první klíč v JSONu                     */

const reorderWithMetaFirst = (obj, meta) => {
  const { meta: _existingMeta, ...rest } = obj;
  return { meta, ...rest };
};

/* ──────────────────────────────────────────────────────────────────────── */

const main = async () => {
  const allFiles = (await recurseFiles(join(ROOT, 'src/content/pages')))
    .filter((p) => /\/(cs|en|de|sk|uk)\.json$/.test(p))
    .sort();

  const stats = {
    total: allFiles.length,
    alreadyCanonical: 0,
    migrated: 0,
    errors: [],
    perLang: { cs: 0, en: 0, de: 0, sk: 0, uk: 0 },
  };

  for (const f of allFiles) {
    const langMatch = f.match(/\/(cs|en|de|sk|uk)\.json$/);
    if (!langMatch) continue;
    const lang = langMatch[1];
    const slug = relative(join(ROOT, 'src/content/pages'), dirname(f)).replace(/[\\/]+/g, '/');

    let data;
    try {
      data = JSON.parse(await readFile(f, 'utf8'));
    } catch (e) {
      stats.errors.push(`${f}: parse error: ${e.message}`);
      continue;
    }

    const hasCanonicalMeta = !!(data?.meta?.title && data?.meta?.description);

    if (hasCanonicalMeta) {
      stats.alreadyCanonical++;
      continue;
    }

    const title = resolveTitle(data, slug, lang);
    const description = resolveDescription(data, lang);

    if (!title) {
      stats.errors.push(`${f}: no title found (slug=${slug})`);
      continue;
    }

    const meta = {
      title: String(title).trim(),
      description: String(description).trim(),
    };

    if (REPORT_ONLY) {
      console.log(`  WOULD MIGRATE: ${slug}/${lang}.json  →  meta.title="${meta.title.slice(0, 60)}"`);
      stats.migrated++;
      continue;
    }

    // Reordering: meta jako první klíč
    const next = reorderWithMetaFirst(data, meta);

    if (!DRY) {
      // Pretty-print s 2-mezerovým odsazením, zachovat UTF-8
      await writeFile(f, JSON.stringify(next, null, 2) + '\n', 'utf8');
    }
    stats.migrated++;
    stats.perLang[lang]++;
  }

  /* Report */
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PAGE METADATA MIGRATION REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mode: ${DRY ? (REPORT_ONLY ? 'REPORT-ONLY (no changes)' : 'DRY-RUN') : 'WRITE'}`);
  console.log(`  Total files scanned:   ${stats.total}`);
  console.log(`  Already canonical:     ${stats.alreadyCanonical}`);
  console.log(`  Migrated:              ${stats.migrated}`);
  console.log(`  By language: cs=${stats.perLang.cs}  en=${stats.perLang.en}  de=${stats.perLang.de}  sk=${stats.perLang.sk}  uk=${stats.perLang.uk}`);
  console.log(`  Errors:                ${stats.errors.length}`);
  if (stats.errors.length) {
    for (const e of stats.errors) console.log(`    ✗ ${e}`);
  }
  console.log('═══════════════════════════════════════════════════════════');
};

main().catch((e) => {
  console.error('✗ migrate failed:', e);
  process.exit(1);
});
