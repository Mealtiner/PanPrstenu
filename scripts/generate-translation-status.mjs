#!/usr/bin/env node
// Generuje docs/translation-status.md — detailní per-jazyk × per-stránka přehled.
// Pro každou stránku × jazyk:
//   - JSON existuje?
//   - MD existuje?
//   - Plně přeloženo? (porovnání s CS — pokud se hodnoty liší = přeloženo)
//
// Spouští se ručně:
//   node --experimental-strip-types scripts/generate-translation-status.mjs

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const LANGS = ['cs', 'en', 'de', 'sk', 'uk'];

/**
 * Walk content/pages/ a content/pages-long/ a vytvoř seznam slugů.
 * Slug = relativní cesta od dané root složky bez {lang}.{ext}.
 */
function findSlugs() {
  const slugs = new Set();
  const roots = ['src/content/pages', 'src/content/pages-long'];

  for (const root of roots) {
    const fullRoot = join(ROOT, root);
    if (!existsSync(fullRoot)) continue;
    walk(fullRoot, fullRoot);
  }

  function walk(base, dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(base, full);
      } else if (/\.(json|md)$/.test(name)) {
        const langMatch = name.match(/^(cs|en|de|sk|uk)\.(json|md)$/);
        if (langMatch) {
          const slug = relative(base, dir).replace(/\\/g, '/');
          slugs.add(slug);
        }
      }
    }
  }

  return [...slugs].sort();
}

/**
 * Načte obsah souboru (JSON nebo MD frontmatter+body).
 * Vrací stringy hodnot pro porovnání s CS variantou.
 */
function loadValues(filePath) {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, 'utf8');
  if (filePath.endsWith('.json')) {
    try {
      const data = JSON.parse(content);
      return flattenValues(data);
    } catch {
      return null;
    }
  } else if (filePath.endsWith('.md')) {
    // Frontmatter + body
    const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (m) {
      const fm = m[1];
      const body = m[2];
      const fmValues = {};
      for (const line of fm.split('\n')) {
        const kv = line.match(/^(\w+):\s*(.*)$/);
        if (kv) fmValues[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
      }
      fmValues._body_length = String(body.trim().length);
      fmValues._body_preview = body.trim().slice(0, 200);
      return fmValues;
    }
    return { _body_length: String(content.length), _body_preview: content.slice(0, 200) };
  }
  return null;
}

/** Rekurzivně vyplaceně hodnoty z JSON do {key.path: stringValue}. */
function flattenValues(obj, prefix = '') {
  const out = {};
  if (obj === null || obj === undefined) return out;
  if (typeof obj === 'string') {
    out[prefix || '.'] = obj;
    return out;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    out[prefix || '.'] = String(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      Object.assign(out, flattenValues(obj[i], `${prefix}[${i}]`));
    }
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flattenValues(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

/**
 * Stav per slug × lang:
 *   - exists: má soubor (json nebo md)
 *   - format: 'json' | 'md' | null
 *   - translated: 'full' (žádná hodnota se neshoduje s CS) | 'partial' (>50% liší) | 'placeholder' (vše stejné jako CS) | 'na' | 'cs'
 *   - missing_keys: počet klíčů v CS, které chybí v této variantě
 *   - same_as_cs: počet hodnot identických s CS (= nepřeložené)
 *   - total_keys: celkový počet klíčů v CS
 */
function evaluate(slug, lang, csValues, langValues) {
  if (!langValues) return { exists: false, format: null, translated: 'na', missing_keys: 0, same_as_cs: 0, total_keys: 0 };

  // Format detection
  const formatJson = existsSync(join(ROOT, 'src/content/pages', slug, `${lang}.json`));
  const formatMd = existsSync(join(ROOT, 'src/content/pages-long', slug, `${lang}.md`));
  const format = formatJson ? 'json' : formatMd ? 'md' : null;

  if (lang === 'cs') {
    return { exists: true, format, translated: 'cs', missing_keys: 0, same_as_cs: 0, total_keys: Object.keys(csValues).length };
  }

  let same = 0;
  let missing = 0;
  const total = Object.keys(csValues).length;

  for (const key of Object.keys(csValues)) {
    if (!(key in langValues)) {
      missing++;
    } else if (csValues[key] === langValues[key]) {
      same++;
    }
  }

  // Body preview (markdown) — also check identity
  // No special handling; flatten covers both

  let translated;
  const samePct = total === 0 ? 0 : same / total;
  if (samePct < 0.05) translated = 'full';        // < 5% same as CS = full
  else if (samePct < 0.5) translated = 'partial'; // 5-50%
  else if (samePct < 0.95) translated = 'mostly-cs';
  else translated = 'placeholder';                // ≥95% = placeholder (essentially CS copy)

  return { exists: true, format, translated, missing_keys: missing, same_as_cs: same, total_keys: total };
}

const slugs = findSlugs();

// Build report
const rows = [];
for (const slug of slugs) {
  // Find CS values (try both pages/ and pages-long/)
  let csValues = loadValues(join(ROOT, 'src/content/pages', slug, 'cs.json')) ??
                 loadValues(join(ROOT, 'src/content/pages-long', slug, 'cs.md'));
  if (!csValues) continue;

  const langStatus = {};
  for (const lang of LANGS) {
    const langValues = loadValues(join(ROOT, 'src/content/pages', slug, `${lang}.json`)) ??
                       loadValues(join(ROOT, 'src/content/pages-long', slug, `${lang}.md`));
    langStatus[lang] = evaluate(slug, lang, csValues, langValues);
  }
  rows.push({ slug, langStatus });
}

// Build markdown
function emoji(state) {
  switch (state.translated) {
    case 'cs': return '🇨🇿';        // base CS
    case 'full': return '✅';        // plně přeloženo
    case 'partial': return '🟡';     // částečně přeloženo
    case 'mostly-cs': return '🟠';   // většinou CS placeholder
    case 'placeholder': return '⚠️';  // čistý CS placeholder (skoro identické)
    case 'na': return '—';
    default: return '?';
  }
}

function fmtCell(state) {
  if (!state.exists) return '—';
  const e = emoji(state);
  if (state.translated === 'cs') return `${e} (${state.total_keys})`;
  if (state.translated === 'na') return '—';
  // Show: emoji + format + counts
  const fmt = state.format === 'md' ? 'md' : 'json';
  const sameStr = state.same_as_cs > 0 ? ` ${state.same_as_cs}/${state.total_keys}` : '';
  const missStr = state.missing_keys > 0 ? ` ✂${state.missing_keys}` : '';
  return `${e} ${fmt}${sameStr}${missStr}`;
}

const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');

let counts = { full: 0, partial: 0, mostlyCs: 0, placeholder: 0, missing: 0 };
for (const r of rows) {
  for (const lang of ['en', 'de', 'sk', 'uk']) {
    const s = r.langStatus[lang];
    if (!s.exists) counts.missing++;
    else if (s.translated === 'full') counts.full++;
    else if (s.translated === 'partial') counts.partial++;
    else if (s.translated === 'mostly-cs') counts.mostlyCs++;
    else if (s.translated === 'placeholder') counts.placeholder++;
  }
}
const totalCells = rows.length * 4;

const out = `# Stav překladů per stránka × jazyk

> **Auto-generováno** skriptem [scripts/generate-translation-status.mjs](../scripts/generate-translation-status.mjs)
> Datum: ${ts} UTC
> Pro update: \`node --experimental-strip-types scripts/generate-translation-status.mjs\`

## Souhrn (non-CS jazyky)

Pro non-CS jazyky (en/de/sk/uk) — celkem **${totalCells}** buněk:

- ✅ **${counts.full}** plně přeloženo (≥95 % hodnot odlišných od CS)
- 🟡 **${counts.partial}** částečně přeloženo (50–95 %)
- 🟠 **${counts.mostlyCs}** většinou CS placeholder (5–50 %)
- ⚠️ **${counts.placeholder}** čistý CS placeholder (≥95 % stejné jako CS)
- — **${counts.missing}** chybí soubor

**Celkem stránek:** ${rows.length}

## Legenda

- 🇨🇿 = CS zdrojový jazyk (počet klíčů v závorce)
- ✅ = plně přeloženo
- 🟡 = částečně přeloženo (některé klíče jsou stále stejné jako CS)
- 🟠 = většinou CS placeholder (málo přeložených klíčů)
- ⚠️ = čistý CS placeholder (95 %+ identický s CS)
- — = soubor neexistuje
- **\`X/Y\`** v buňce = počet klíčů shodných s CS / celkem (nižší = víc přeloženo)
- **\`✂N\`** = chybí N klíčů (struktura JSON není v parity s CS)
- **\`json\` / \`md\`** = formát souboru

## Tabulka

| Stránka | cs | en | de | sk | uk |
|---|---|---|---|---|---|
${rows.map((r) => {
  const cells = LANGS.map((l) => fmtCell(r.langStatus[l]));
  return `| \`${r.slug}\` | ${cells.join(' | ')} |`;
}).join('\n')}

## Poznámky

### Co znamená „placeholder"?

Pro některé stránky (např. \`pravidla\`, \`cookies\`, \`gdpr\`) zatím nemáme reálný překlad
do non-CS jazyků. Místo prázdných stránek tam ukládáme **CS texty s lang_notice**
(varovný banner pro non-CS uživatele, že obsah je zatím v CS). Tato strategie
udržuje strukturní paritu pro CMS — všechny jazyky mají stejné klíče a soubory.

### Jak ověřit překlad

Skript porovnává každý klíč napříč jazyky:
- Pokud je hodnota v non-CS souboru **stejná** jako v CS = nepřeloženo (placeholder)
- Pokud je **odlišná** = přeloženo (i kdyby šlo jen o překlad meta titulku)

Není to dokonalé — krátké identické fráze (např. „Email") se mohou mezi jazyky shodovat
i když je text reálně přeložen. Skript tedy slouží jako **rychlý overview**, ne jako
absolutní pravda.

### Sledování pokroku

Pokaždé po překladu spusť \`node --experimental-strip-types scripts/generate-translation-status.mjs\`
a tabulka se přepíše s aktuálním stavem. Hodí se jako progress tracking pro správce.
`;

writeFileSync(join(ROOT, 'docs/translation-status.md'), out);
console.log(`Wrote docs/translation-status.md: ${rows.length} pages, ${counts.full} ✅, ${counts.partial} 🟡, ${counts.mostlyCs} 🟠, ${counts.placeholder} ⚠️, ${counts.missing} —`);
