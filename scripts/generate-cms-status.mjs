#!/usr/bin/env node
// Vygeneruje docs/cms-status.md s aktuální tabulkou stavu stránek.
// Spouští se ručně po změnách struktur:
//   node --experimental-strip-types scripts/generate-cms-status.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

const files = execSync('find src/pages -name "*.astro" | sort', { encoding: 'utf8', cwd: ROOT })
  .trim().split('\n');

function analyzeFile(relPath) {
  const content = readFileSync(`${ROOT}/${relPath}`, 'utf8');
  const lines = content.split('\n');
  const tCalls = (content.match(/\bt\(['"]/g) ?? []).length;
  let hardcoded = 0;
  let inFm = false, fmEnd = false;
  for (const line of lines) {
    if (line.trim() === '---') {
      if (!inFm && !fmEnd) inFm = true;
      else if (inFm) { inFm = false; fmEnd = true; }
      continue;
    }
    if (inFm) continue;
    if (/^\s*(\/\/|\*|\/\*|<!--|-->)/.test(line)) continue;
    if (/^\s*\{\s*\/\*/.test(line)) continue;
    if (!/[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]/.test(line)) continue;
    const stripped = line
      .replace(/t\(['"][^'"]*['"](?:,\s*\{[^}]*\})?\)/g, '')
      .replace(/tp\(['"`][^'"`]*['"`]\)/g, '');
    if (/[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]/.test(stripped)) hardcoded++;
  }
  return { tCalls, hardcoded };
}

function pageSlugFromAstroPath(p) {
  let s = p.replace(/^src\/pages\//, '').replace(/\.astro$/, '');
  if (s === '404') return '_root/404';
  if (s === 'index') return '_root/index';
  s = s.replace(/^\[lang\]\//, '');
  if (s === 'index') return '_home';
  if (s.endsWith('/index')) s = s.slice(0, -6);
  return s;
}

function hasContent(slug, lang) {
  if (existsSync(`${ROOT}/src/content/pages/${slug}/${lang}.json`)) return 'json';
  if (existsSync(`${ROOT}/src/content/pages-long/${slug}/${lang}.md`)) return 'md';
  if (slug.endsWith('/[slug]')) {
    const parent = slug.slice(0, -7);
    if (existsSync(`${ROOT}/src/content/pages/${parent}/${lang}.json`)) return 'json (parent)';
    if (existsSync(`${ROOT}/src/content/pages-long/${parent}/${lang}.md`)) return 'md (parent)';
  }
  return null;
}

const LANGS = ['cs', 'en', 'de', 'sk', 'uk'];

const rows = [];
let totalReady = 0, totalHardcoded = 0, totalT = 0, totalNa = 0;

for (const f of files) {
  const a = analyzeFile(f);
  const slug = pageSlugFromAstroPath(f);
  const formats = LANGS.map((l) => hasContent(slug, l));
  const allHave = formats.every((x) => x !== null);
  const cells = LANGS.map((l, i) => {
    const fmt = formats[i];
    if (fmt) return '✅';
    if (a.hardcoded > 0) return '❌';
    if (a.tCalls > 0) return '🟡';
    return '⚪';
  });
  const status = a.hardcoded > 0 && allHave ? '🟠 partial' :
                 a.hardcoded > 0 ? '🔴 hardcoded' :
                 allHave ? '🟢 ready' :
                 a.tCalls > 0 ? '🟡 t() only' : '⚪ n/a';
  if (status.startsWith('🟢')) totalReady++;
  else if (status.startsWith('🔴')) totalHardcoded++;
  else if (status.startsWith('🟡') || status.startsWith('🟠')) totalT++;
  else totalNa++;

  const formatType = formats[0] ?? '—';
  rows.push({
    file: f.replace('src/pages/', ''),
    cells,
    tCalls: a.tCalls,
    hardcoded: a.hardcoded,
    status,
    format: formatType,
  });
}

const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
const out = `# CMS-ready stav stránek

> **Auto-generováno** skriptem [scripts/generate-cms-status.mjs](../scripts/generate-cms-status.mjs)
> Datum: ${ts} UTC
> Pro update: \`node --experimental-strip-types scripts/generate-cms-status.mjs\`

## Souhrn

- 🟢 **${totalReady}** ready (texty plně externí, per-lang ve všech 5 jazycích)
- 🟠/🟡 **${totalT}** partial (částečně migrováno)
- 🔴 **${totalHardcoded}** hardcoded (texty stále v .astro)
- ⚪ **${totalNa}** n/a (redirecty, nemá obsah)

**Celkem stránek:** ${rows.length}

## Legenda sloupců

- **cs / en / de / sk / uk** — má daná jazyková mutace externí soubor s texty?
  - ✅ má vlastní per-page JSON nebo markdown
  - ❌ texty v .astro hardcoded
  - 🟡 částečně (přes t() z monolithic ui.ts)
  - ⚪ stránka nemá obsah (redirect)
- **t()** — počet \`t()\` volání v .astro
- **hard.** — počet řádků s českou diakritikou v JSX (ne v t/tp)
- **format** — kde je obsah uložen (json / md / žádné)

## Tabulka

| Stránka | cs | en | de | sk | uk | t() | hard. | format | CMS-ready |
|---|---|---|---|---|---|---|---|---|---|
${rows.map((r) => `| \`${r.file}\` | ${r.cells.join(' | ')} | ${r.tCalls} | ${r.hardcoded} | ${r.format ?? '—'} | ${r.status} |`).join('\n')}

## Kde jsou texty uložené

### \`src/i18n/ui/{lang}.json\` — sdílené UI texty
- Krátké, často opakované stringy (nav.*, common.*, footer.*, breadcrumb.*, error.*)
- Volá se přes \`t('klíč')\`

### \`src/content/pages/{slug}/{lang}.json\` — per-page JSON obsah
- Strukturovaná data per stránka (meta, hero, sekce, arrays jako items[])
- Volá se přes \`getPageData<T>('slug', lang)\` nebo \`getPageContent('slug', lang)\` → \`tp('key')\`
- Vhodné pro stránky s tabulkami, kartami, grafickými prvky

### \`src/content/pages-long/{slug}/{lang}.md\` — long-form markdown
- Pro stránky s velkým objemem textu (cookies, gdpr, podmínky atd.)
- Frontmatter pro meta, body je markdown
- Renderuje se přes \`<Content />\` z astro:content
- Plná podpora WYSIWYG editorů (Sveltia, Decap)

### \`src/content/site/event/{lang}.json\` — sdílená data o akci
- Termín, místo, popisy faktů
- Volá se přes \`getEvent(lang)\`

### \`src/content/factions/*.yml\` — armády (lore data)
- YAML, plánovaná migrace na meta.json + lang.md per audit

## Poznámky pro CMS

Všechny tyto soubory jsou **CMS-ready**:
- Sveltia CMS edituje JSON, YAML i MD nativně, commituje přímo do gitu
- Directus / Payload mohou tyto soubory číst přes Git API nebo importovat do DB
`;

writeFileSync(`${ROOT}/docs/cms-status.md`, out);
console.log(`Wrote docs/cms-status.md (${rows.length} pages, ${totalReady} ready, ${totalHardcoded} hardcoded)`);
