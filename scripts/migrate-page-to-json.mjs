#!/usr/bin/env node
// Migrace 🟡 stránky z ui.ts page.X.* keys → per-page JSON.
// Usage: node --experimental-strip-types scripts/migrate-page-to-json.mjs <slug> <ui-namespace>
//   slug = složka v src/content/pages/, např. "bezpecnost" nebo "role/hobiti"
//   ui-namespace = prefix v ui.ts JSON, např. "page.safety" (bez koncové tečky)
//
// Co skript dělá:
//  1. Vytvoří src/content/pages/{slug}/{lang}.json se všemi keys z ui.ts
//     pod daným namespace (klíče zbavené prefixu)
//  2. Smaže odpovídající keys z src/i18n/ui/{lang}.json
//  3. V .astro souboru:
//     - přidá `import { getPageContent } from '@lib/content/pages';`
//     - přidá `const tp = getPageContent('{slug}', lang);` po `getTranslation`
//     - nahradí `t('{ui-namespace}.X')` → `tp('X')`
//
// VŽDY potom spusť `npm run build` na ověření.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [, , slug, namespace] = process.argv;
if (!slug || !namespace) {
  console.error('Usage: migrate-page-to-json.mjs <slug> <ui-namespace>');
  process.exit(1);
}

const LANGS = ['cs', 'en', 'de', 'sk', 'uk'];
const ROOT = process.cwd();
const nsPrefix = namespace.endsWith('.') ? namespace : `${namespace}.`;

// 1) Vytvoř per-page JSON
const dir = `${ROOT}/src/content/pages/${slug}`;
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

let movedCount = 0;
for (const lang of LANGS) {
  const uiPath = `${ROOT}/src/i18n/ui/${lang}.json`;
  const ui = JSON.parse(readFileSync(uiPath, 'utf8'));
  const pageDict = {};
  for (const k of Object.keys(ui)) {
    if (k.startsWith(nsPrefix)) {
      const subKey = k.slice(nsPrefix.length);
      pageDict[subKey] = ui[k];
      delete ui[k];
    }
  }
  if (Object.keys(pageDict).length === 0) {
    console.warn(`  ${lang}: 0 keys matched (namespace "${namespace}" missing?)`);
    continue;
  }
  movedCount += Object.keys(pageDict).length;
  // Write per-page JSON
  writeFileSync(`${dir}/${lang}.json`, JSON.stringify(pageDict, null, 2) + '\n');
  // Write back ui.ts JSON (without those keys)
  writeFileSync(uiPath, JSON.stringify(ui, null, 2) + '\n');
  console.log(`  ${lang}: moved ${Object.keys(pageDict).length} keys → pages/${slug}/${lang}.json`);
}

console.log(`Moved ${movedCount} keys total (across 5 langs).`);

// 2) Najdi .astro soubor
const candidates = [
  `${ROOT}/src/pages/[lang]/${slug}/index.astro`,
  `${ROOT}/src/pages/[lang]/${slug}.astro`,
];
let astroPath = candidates.find((p) => existsSync(p));
if (!astroPath) {
  console.warn(`No .astro file at ${candidates.join(' or ')} — skipping .astro update.`);
  process.exit(0);
}

let astro = readFileSync(astroPath, 'utf8');
const before = astro;

// 3a) Přidej import getPageContent (pokud není)
if (!astro.includes("from '@lib/content/pages'")) {
  // Najdi řádek `import { getTranslation } from '@i18n/ui';` a přidej za něj
  astro = astro.replace(
    /(import \{ getTranslation \} from '@i18n\/ui';)/,
    `$1\nimport { getPageContent } from '@lib/content/pages';`
  );
}

// 3b) Přidej `const tp = getPageContent('{slug}', lang);` po `const t = getTranslation(lang);`
if (!astro.includes(`getPageContent('${slug}'`)) {
  astro = astro.replace(
    /(const t = getTranslation\(lang\);)/,
    `$1\nconst tp = getPageContent('${slug}', lang);`
  );
}

// 3c) Nahraď t('{namespace}.X') → tp('X')
const tCallRe = new RegExp(`t\\(\\s*'${namespace.replace(/\./g, '\\.')}\\.([a-zA-Z0-9_]+)'\\s*\\)`, 'g');
const tCallReDouble = new RegExp(`t\\(\\s*"${namespace.replace(/\./g, '\\.')}\\.([a-zA-Z0-9_]+)"\\s*\\)`, 'g');
astro = astro.replace(tCallRe, (_m, k) => `tp('${k}')`);
astro = astro.replace(tCallReDouble, (_m, k) => `tp('${k}')`);

if (astro === before) {
  console.warn('  .astro: no changes (no t() calls matched namespace?)');
} else {
  writeFileSync(astroPath, astro);
  console.log(`  .astro: updated ${astroPath}`);
}
