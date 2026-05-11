#!/usr/bin/env node
/**
 * apply-translations.mjs — aplikuje překlady do cílových JSON souborů
 * Datum: 2026-05-11
 *
 * Vstup: cesta k JSON souboru s formátem
 *   { "<slug>::<dot.path>": "translated string", ... }
 *
 * Použití:
 *   node scripts/apply-translations.mjs --lang en /tmp/translations-en.json
 *
 * Klíče ve formátu `slug::path`:
 *   slug = relativní cesta v src/content/pages/ (např. "mapa", "svet-stredozeme/mistopis")
 *   path = tečková notace s array indexy (např. "chapters[2].title", "regions[1].places[0].name")
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const flagIdx = args.indexOf('--lang');
if (flagIdx < 0) { console.error('Použij: --lang en|de|sk|uk <file.json>'); process.exit(1); }
const LANG = args[flagIdx + 1];
const FILE = args.find((a, i) => i !== flagIdx && i !== flagIdx + 1 && !a.startsWith('--'));
if (!LANG || !FILE) { console.error('Chybí --lang nebo soubor.'); process.exit(1); }

const setByPath = (obj, path, value) => {
  const parts = [];
  const re = /([^.[\]]+)|\[(\d+)\]/g;
  let m;
  while ((m = re.exec(path))) parts.push(m[2] !== undefined ? Number(m[2]) : m[1]);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null) cur[k] = typeof parts[i + 1] === 'number' ? [] : {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
};

// Structure-sync: pro každý klíč v cs, který v target chybí, zkopíruj
// hodnotu z cs (deep clone). Tím zajistíme, že target má stejnou strukturu
// jako cs (např. chapters[10] s id/icon/body_html), takže následný překlad
// jen přepíše konkrétní textová pole, ne vytvoří prázdné objekty.
const syncStructure = (cs, target) => {
  if (Array.isArray(cs)) {
    if (!Array.isArray(target)) return JSON.parse(JSON.stringify(cs));
    const out = target.slice();
    for (let i = 0; i < cs.length; i++) {
      if (out[i] === undefined) {
        out[i] = JSON.parse(JSON.stringify(cs[i]));
      } else if (typeof cs[i] === 'object' && cs[i] !== null) {
        out[i] = syncStructure(cs[i], out[i]);
      }
    }
    return out;
  }
  if (typeof cs === 'object' && cs !== null) {
    if (typeof target !== 'object' || target === null || Array.isArray(target)) {
      return JSON.parse(JSON.stringify(cs));
    }
    const out = { ...target };
    for (const k of Object.keys(cs)) {
      if (!(k in out)) {
        out[k] = JSON.parse(JSON.stringify(cs[k]));
      } else if (typeof cs[k] === 'object' && cs[k] !== null) {
        out[k] = syncStructure(cs[k], out[k]);
      }
    }
    return out;
  }
  return target;
};

const translations = JSON.parse(await readFile(FILE, 'utf8'));

// Skupinuj podle slug
const bySlug = {};
for (const [combined, value] of Object.entries(translations)) {
  const sep = combined.indexOf('::');
  if (sep < 0) continue;
  const slug = combined.slice(0, sep);
  const path = combined.slice(sep + 2);
  (bySlug[slug] = bySlug[slug] || []).push([path, value]);
}

let totalApplied = 0;
for (const [slug, entries] of Object.entries(bySlug)) {
  const filePath = join(ROOT, 'src/content/pages', slug, `${LANG}.json`);
  const csPath = join(ROOT, 'src/content/pages', slug, 'cs.json');
  let data;
  let cs;
  try {
    data = JSON.parse(await readFile(filePath, 'utf8'));
    cs = JSON.parse(await readFile(csPath, 'utf8'));
  } catch (e) { console.error(`  ✗ ${slug}: ${e.message}`); continue; }
  // Nejdřív structure-sync z cs (doplní chybějící klíče/array indexy
  // pomocí cs verze — žádné prázdné objekty po překladu titles)
  data = syncStructure(cs, data);
  for (const [path, value] of entries) {
    setByPath(data, path, value);
    totalApplied++;
  }
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  ✓ ${slug}/${LANG}.json — ${entries.length} keys applied (structure synced)`);
}
console.log(`\nTotal: ${totalApplied} translations applied to ${LANG} files.`);
