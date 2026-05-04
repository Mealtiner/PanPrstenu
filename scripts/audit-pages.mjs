#!/usr/bin/env node
// Audit script: detekuje hardcoded CS texty v .astro stránkách + stav per-page JSON
// Usage: node --experimental-strip-types scripts/audit-pages.mjs [--table]
//   --table   vypíše Markdown tabulku se stavem per-language a CMS-ready
//
// Heuristika "hardcoded":
//  - Řádek mimo frontmatter, který obsahuje českou diakritiku
//  - A NEJDE celý nahradit `t('…')` voláním
//  - Vyloučí komentáře (// /* * <!--)
//
// CMS-ready definice (3 úrovně):
//  🟢 page má vlastní per-page JSON v src/content/pages/{slug}/{lang}.json
//  🟡 page používá t() (z monolithic ui.ts), ale ne per-page JSON
//  🔴 page má hardcoded CS texty

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const wantTable = args.includes('--table');

const files = execSync('find src/pages -name "*.astro" | sort', { encoding: 'utf8', cwd: ROOT })
  .trim().split('\n');

function analyzeFile(relPath) {
  const content = readFileSync(`${ROOT}/${relPath}`, 'utf8');
  const lines = content.split('\n');

  const tCalls = (content.match(/\bt\(['"]/g) ?? []).length;

  let hardcodedLines = 0;
  let inFrontmatter = false;
  let frontmatterEnd = false;
  for (const line of lines) {
    if (line.trim() === '---') {
      if (!inFrontmatter && !frontmatterEnd) inFrontmatter = true;
      else if (inFrontmatter) { inFrontmatter = false; frontmatterEnd = true; }
      continue;
    }
    if (inFrontmatter) continue;
    if (/^\s*(\/\/|\*|\/\*|<!--|-->)/.test(line)) continue;
    if (!/[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]/.test(line)) continue;
    const stripped = line.replace(/t\(['"][^'"]*['"](?:,\s*\{[^}]*\})?\)/g, '');
    if (/[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]/.test(stripped)) hardcodedLines++;
  }

  return { tCalls, hardcodedLines, totalLines: lines.length };
}

function pageSlugFromAstroPath(relPath) {
  // src/pages/[lang]/role/organizatori/index.astro → role/organizatori
  // src/pages/404.astro → _root/404
  // src/pages/index.astro → _root/index
  // src/pages/[lang]/index.astro → _home
  let p = relPath.replace(/^src\/pages\//, '').replace(/\.astro$/, '');
  if (p === '404') return '_root/404';
  if (p === 'index') return '_root/index';
  p = p.replace(/^\[lang\]\//, '');
  if (p === 'index') return '_home';
  if (p.endsWith('/index')) p = p.slice(0, -6);
  return p;
}

function hasPerPageJson(slug, lang) {
  return existsSync(`${ROOT}/src/content/pages/${slug}/${lang}.json`);
}

function langStatus(slug, hardcoded, hasJson, lang, tCalls) {
  if (hasJson) return '✅';        // own per-page JSON file
  if (hardcoded > 0) return '❌';  // hardcoded CS in .astro
  if (tCalls > 0) return '🟡';     // texts via t() in monolithic ui.ts (not per-page)
  return '⚪';                      // no text
}

function cmsStatus(slug, hardcoded, perPageAll, tCalls) {
  if (perPageAll) return '🟢 ready';
  if (hardcoded > 0) return '🔴 hardcoded';
  if (tCalls > 0) return '🟡 t() only';
  return '⚪ n/a';
}

const LANGS = ['cs', 'en', 'de', 'sk', 'uk'];

if (wantTable) {
  console.log('| Stránka | cs | en | de | sk | uk | t() | hardcoded | CMS-ready |');
  console.log('|---|---|---|---|---|---|---|---|---|');
} else {
  console.log('Page audit (use --table for Markdown):');
}

let totalReady = 0, totalT = 0, totalHard = 0, totalNa = 0;

for (const f of files) {
  const a = analyzeFile(f);
  const slug = pageSlugFromAstroPath(f);
  const langStates = LANGS.map((l) => langStatus(slug, a.hardcodedLines, hasPerPageJson(slug, l), l, a.tCalls));
  const allHaveJson = LANGS.every((l) => hasPerPageJson(slug, l));
  const cms = cmsStatus(slug, a.hardcodedLines, allHaveJson, a.tCalls);

  if (cms.startsWith('🟢')) totalReady++;
  else if (cms.startsWith('🟡')) totalT++;
  else if (cms.startsWith('🔴')) totalHard++;
  else totalNa++;

  if (wantTable) {
    console.log(`| \`${f.replace('src/pages/', '')}\` | ${langStates.join(' | ')} | ${a.tCalls} | ${a.hardcodedLines} | ${cms} |`);
  } else {
    console.log(`${f}: t()=${a.tCalls} hardcoded=${a.hardcodedLines} cms=${cms}`);
  }
}

if (wantTable) {
  console.log('');
  console.log(`**Souhrn:** 🟢 ${totalReady} ready · 🟡 ${totalT} t()-only · 🔴 ${totalHard} hardcoded · ⚪ ${totalNa} n/a`);
}
