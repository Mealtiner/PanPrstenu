#!/usr/bin/env node
/**
 * translation-status.mjs — audit pokrytí překladů per stránka × jazyk
 * Datum: 2026-05-11
 *
 * Účel: zjistit, kolik % obsahových stringů v `<lang>.json` se liší od `cs.json`
 * (tj. je opravdu přeloženo). Výstup je strukturovaná data, kterou:
 *   1) využívá <TranslationStatusNotice> v BaseLayout (zobrazí notice jen na
 *      stránkách, kde je < 90 % přeloženo)
 *   2) využívá `auto-translate.mjs` pro určení, co poslat na AI překlad
 *
 * Výstup: src/data/translation-status.json
 *
 * Strategie identifikátorů (NEPOČÍTAJÍ SE jako "string k překladu"):
 *   - klíče: id, icon, href, url, src, slug, key, image, image_url, video_id
 *   - hodnoty: URL (http://, https://, /, mailto:), icon slug (lucide:*, game-icons:*),
 *     YouTube ID (11-char alphanumeric), slug-like (^[a-z0-9_-]+$),
 *     barvy (#RRGGBB), čísla
 *
 * Spuštění:
 *   node scripts/translation-status.mjs           # default output
 *   node scripts/translation-status.mjs --verbose # vypíše per-page percenta
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const VERBOSE = process.argv.includes('--verbose');
const LANGS = ['en', 'de', 'sk', 'uk'];

/* ────────────────────────────────────────────────────────── helpers */

const recurseFiles = async (dir) => {
  const out = [];
  try {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) out.push(...await recurseFiles(full));
      else out.push(full);
    }
  } catch { /* directory missing */ }
  return out;
};

const SKIP_KEY_RE = /(^|\.)(id|icon|href|url|src|slug|key|image_url|image|video_id|color|bg_color|bg|emblem|photo|date|datetime|cookie_name|provider|category|type|order|priority|class|className|status|format|target|rel|role|placeholder)$/i;

const isIdentifierValue = (v) => {
  if (typeof v !== 'string') return true;
  const s = v.trim();
  if (!s) return true;
  if (/^https?:\/\//.test(s)) return true;
  if (/^mailto:/.test(s)) return true;
  if (/^tel:/.test(s)) return true;
  if (/^\/[a-z0-9/_-]*\/?$/i.test(s)) return true;        // path /cs/...
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return true;            // hex color
  if (/^(lucide|game-icons|material-symbols):/i.test(s)) return true; // icon
  if (/^[a-z][a-z0-9_-]{0,30}$/.test(s)) return true;      // slug-like
  if (/^[A-Za-z0-9_-]{11}$/.test(s) && !/\s/.test(s)) return true; // YouTube ID
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return true;           // ISO date
  if (/^\d+$/.test(s)) return true;                        // pure number
  // Pure punctuation/separators (".", ",", " · ", "...")
  if (/^[\s.,;:!?·•◆–—\-]+$/.test(s)) return true;
  // Time formats jako "~16:00", "10:00 – 14:00", "od 12:00"
  if (/^[~\sodfromabuntilbis]{0,8}\d{1,2}[:.]\d{2}(\s*[–\-]\s*\d{1,2}[:.]\d{2})?$/i.test(s)) return true;
  // Krátké stringy (< 25 chars) bez českých diakritiky-only znaků,
  // které jsou často proper nouns/abbreviations/emaily/GPS/UUID/...
  // (jen pokud NEOBSAHUJÍ malá písmena typická pro CZ text mezi diakritikou)
  if (s.length < 25 && !/[áčďéěíňóřšťúůýž]/i.test(s) && /^[A-Z][\w@.\s\-–—'"()ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]*$/.test(s)) return true;
  // Email
  if (/^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(s)) return true;
  // Telefon
  if (/^[+\d\s]+$/.test(s) && /\d/.test(s)) return true;
  return false;
};

const flatten = (obj, prefix = '') => {
  const out = {};
  if (obj == null) return out;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      Object.assign(out, flatten(obj[k], next));
    }
  }
  return out;
};

// Allowlist: klíče/hodnoty, které mají být intencionálně stejné napříč jazyky.
let ALLOWLIST = { patterns: [], valueGlobs: [] };
try {
  ALLOWLIST = JSON.parse(await readFile(join(ROOT, 'src/data/translation-allowlist.json'), 'utf8'));
} catch { /* allowlist optional */ }
const ALLOWLIST_PATTERN_RES = ALLOWLIST.patterns.map((p) => new RegExp(p));
const ALLOWLIST_VALUES = new Set(ALLOWLIST.valueGlobs);

const isAllowedSame = (slug, key, value) => {
  const combined = `${slug}::${key}`;
  for (const re of ALLOWLIST_PATTERN_RES) if (re.test(combined)) return true;
  if (ALLOWLIST_VALUES.has(value)) return true;
  return false;
};

const auditPage = (cs, target, slug) => {
  const csFlat = flatten(cs);
  const targetFlat = flatten(target);
  let total = 0, same = 0, missing = 0;
  const sameKeys = [];
  for (const k of Object.keys(csFlat)) {
    const csVal = csFlat[k];
    if (typeof csVal !== 'string') continue;
    if (SKIP_KEY_RE.test(k)) continue;
    if (isIdentifierValue(csVal)) continue;
    if (isAllowedSame(slug, k, csVal)) continue;
    total++;
    const tVal = targetFlat[k];
    if (tVal === undefined) {
      missing++;
      sameKeys.push(k);
    } else if (tVal === csVal) {
      same++;
      sameKeys.push(k);
    }
  }
  const translated = total - same - missing;
  const pct = total === 0 ? 100 : Math.round((translated / total) * 100);
  return { total, translated, same, missing, pct, sameKeys };
};

/* ────────────────────────────────────────────────────────── main */

const main = async () => {
  const pageDirs = (await recurseFiles(join(ROOT, 'src/content/pages')))
    .filter((p) => p.endsWith('/cs.json'))
    .map((p) => dirname(p))
    .filter((d) => !d.endsWith('/_root'))
    .sort();

  const result = {};
  for (const lang of LANGS) result[lang] = {};
  const summary = { en: { pages: 0, fullyTranslated: 0, totalStrings: 0, sameAsCs: 0 } };
  for (const l of LANGS) summary[l] = { pages: 0, fullyTranslated: 0, totalStrings: 0, sameAsCs: 0 };

  for (const dir of pageDirs) {
    const slug = relative(join(ROOT, 'src/content/pages'), dir).replace(/[\\/]+/g, '/');
    if (slug.startsWith('_root')) continue;
    const csPath = join(dir, 'cs.json');
    let cs;
    try { cs = JSON.parse(await readFile(csPath, 'utf8')); }
    catch { continue; }

    for (const lang of LANGS) {
      const tPath = join(dir, `${lang}.json`);
      let target;
      try { target = JSON.parse(await readFile(tPath, 'utf8')); }
      catch { target = {}; }
      const audit = auditPage(cs, target, slug);
      // URL key: respektuje special slug _home → "/"
      const urlKey = slug === '_home' ? `/${lang}/` : `/${lang}/${slug}/`;
      result[lang][urlKey] = {
        slug,
        pct: audit.pct,
        translated: audit.translated,
        same: audit.same,
        missing: audit.missing,
        total: audit.total,
      };
      summary[lang].pages++;
      summary[lang].totalStrings += audit.total;
      summary[lang].sameAsCs += audit.same + audit.missing;
      if (audit.pct === 100) summary[lang].fullyTranslated++;
    }
  }

  // Zápis do src/data
  await mkdir(join(ROOT, 'src/data'), { recursive: true });
  const outPath = join(ROOT, 'src/data/translation-status.json');
  await writeFile(outPath, JSON.stringify({
    generated: new Date().toISOString(),
    summary,
    pages: result,
  }, null, 2) + '\n', 'utf8');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  TRANSLATION STATUS AUDIT');
  console.log('═══════════════════════════════════════════════════════════');
  for (const lang of LANGS) {
    const s = summary[lang];
    const pct = s.totalStrings === 0 ? 100 : Math.round(((s.totalStrings - s.sameAsCs) / s.totalStrings) * 100);
    console.log(`  ${lang.toUpperCase()}: ${s.fullyTranslated}/${s.pages} pages fully translated · ${pct}% strings · ${s.sameAsCs} stringů zbývá`);
  }
  console.log(`  → ${relative(ROOT, outPath)}`);

  if (VERBOSE) {
    console.log('\n  Per-page breakdown (EN, < 100 %):');
    const enPages = Object.entries(result.en)
      .filter(([_, v]) => v.pct < 100)
      .sort((a, b) => a[1].pct - b[1].pct);
    for (const [url, v] of enPages) {
      console.log(`    ${url.padEnd(50)} ${String(v.pct).padStart(3)}%  (${v.translated}/${v.total} translated, ${v.same + v.missing} todo)`);
    }
  }
  console.log('═══════════════════════════════════════════════════════════');
};

main().catch((e) => {
  console.error('✗ translation-status failed:', e);
  process.exit(1);
});
