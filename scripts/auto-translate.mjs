#!/usr/bin/env node
/**
 * auto-translate.mjs — překlad chybějících stringů přes Anthropic API
 * Datum: 2026-05-11
 *
 * Vstup: translation-status.json (vyrobený audit skriptem).
 * Pro každou stránku × jazyk, kde pct < 100, vezme chybějící klíče (target
 * value === cs value, nebo missing) a pošle batch na Claude API s LARP/Tolkien
 * kontextem. Výsledek zapíše do cílového JSONu.
 *
 * Spuštění:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/auto-translate.mjs --lang en --dry
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/auto-translate.mjs --lang en
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/auto-translate.mjs            # všechny 4 jazyky
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/auto-translate.mjs --page minule-rocniky
 *
 * Flagy:
 *   --lang <code>    Omezit na jeden jazyk (en|de|sk|uk). Default: vše.
 *   --page <slug>    Omezit na jednu stránku. Default: vše < 100 %.
 *   --dry            Jen vypíše, co by se přeložilo, žádné API volání.
 *   --limit N        Stop po N stringích (cost cap).
 *   --model <name>   Claude model (default: claude-sonnet-4-5-20250929)
 *
 * Cena: cca $0.003–0.008 / string (Sonnet 4.5 pricing). ~$5–15 za celý web.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1]?.startsWith('--') ? true : args[i + 1] ?? true) : null;
};
const has = (name) => args.includes(`--${name}`);

const ONLY_LANG = flag('lang');
const ONLY_PAGE = flag('page');
const DRY = has('dry');
const LIMIT = flag('limit') ? parseInt(flag('limit'), 10) : Infinity;
const MODEL = flag('model') ?? 'claude-sonnet-4-5-20250929';
const API_KEY = process.env.ANTHROPIC_API_KEY;

const LANGS = ['en', 'de', 'sk', 'uk'];
const TARGET_LANGS = ONLY_LANG ? [ONLY_LANG] : LANGS;

if (!DRY && !API_KEY) {
  console.error('✗ ANTHROPIC_API_KEY není nastaven. Použij `--dry` pro náhled.');
  process.exit(1);
}

/* ────────────────────────────────────────────────────────── glossary */

const LANG_NAMES = {
  en: 'English',
  de: 'German',
  sk: 'Slovak',
  uk: 'Ukrainian',
};

const GLOSSARY = {
  en: [
    '"Pán Prstenů" → "The Lord of the Rings"',
    '"Bitva o Středozem" → "Battle for Middle-earth"',
    '"Středozem" → "Middle-earth"',
    '"Křtiny", "Bukovina" → keep as-is (place names)',
    '"larp" → "LARP" (uppercase)',
    '"frakce", "armáda" → "faction", "army"',
    '"strana" → "side"',
    '"kostým" → "costume"',
    '"zbraň", "zbroj" → "weapon", "armour" (UK English spelling)',
    '"životy" (game lives) → "lives"',
    '"smrtelně raněn(a)" → "mortally wounded"',
    '"oživení" → "respawn"',
    '"orga", "organizátor" → "organiser"',
    '"pořadatel" → "organiser"',
    '"účastník" → "participant"',
    '"hráč" → "player"',
    '"jezdci Rohanu" → "Riders of Rohan"',
    '"Bílý strom" → "White Tree"',
    '"Svobodné národy" → "Free Peoples"',
    '"Síly Temného pána" → "Forces of the Dark Lord"',
    '"Skřeti" → "Orcs"',
    '"Skuruti" / "Uruk-hai" → "Uruk-hai"',
    '"Trpaslíci" → "Dwarves"',
    '"Elfové" → "Elves"',
    '"Hobiti" → "Hobbits"',
    'Tone: practical, slightly poetic, fit for a LARP/Tolkien fantasy event website. Address the reader as "you" (informal). Translate naturally, do not be literal.',
  ],
  de: [
    '"Pán Prstenů" → "Der Herr der Ringe"',
    '"Bitva o Středozem" → "Schlacht um Mittelerde"',
    '"Středozem" → "Mittelerde"',
    '"Křtiny", "Bukovina" → unverändert lassen (Ortsnamen)',
    '"larp" → "LARP"',
    '"frakce", "armáda" → "Fraktion", "Armee"',
    '"strana" → "Seite"',
    '"kostým" → "Kostüm"',
    '"zbraň", "zbroj" → "Waffe", "Rüstung"',
    '"životy" → "Leben"',
    '"smrtelně raněn(a)" → "tödlich verwundet"',
    '"organizátor" → "Veranstalter"',
    '"účastník" → "Teilnehmer"',
    '"hráč" → "Spieler"',
    '"Jezdci Rohanu" → "Reiter von Rohan"',
    '"Bílý strom" → "Weißer Baum"',
    '"Svobodné národy" → "Freie Völker"',
    '"Síly Temného pána" → "Mächte des Dunklen Herrschers"',
    '"Skřeti" → "Orks"',
    '"Skuruti" → "Uruk-hai"',
    '"Trpaslíci" → "Zwerge"',
    '"Elfové" → "Elben"',
    '"Hobiti" → "Hobbits"',
    'Ton: praktisch, leicht poetisch, für eine LARP/Tolkien-Fantasy-Veranstaltungswebsite. Sprich den Leser als "du" an (informell).',
  ],
  sk: [
    '"Pán Prstenů" → "Pán prsteňov"',
    '"Bitva o Středozem" → "Bitka o Stredozem"',
    '"Středozem" → "Stredozem"',
    '"Křtiny", "Bukovina" → ponechať (názvy obcí)',
    '"larp" → "LARP"',
    '"frakce", "armáda" → "frakcia", "armáda"',
    '"strana" → "strana"',
    '"kostým" → "kostým"',
    '"zbraň", "zbroj" → "zbraň", "zbroj"',
    '"životy" → "životy"',
    '"smrtelně raněn(a)" → "smrteľne zranený(á)"',
    '"organizátor" → "organizátor"',
    '"účastník" → "účastník"',
    '"hráč" → "hráč"',
    '"Jezdci Rohanu" → "Jazdci Rohanu"',
    '"Bílý strom" → "Biely strom"',
    '"Svobodné národy" → "Slobodné národy"',
    '"Síly Temného pána" → "Sily Temného pána"',
    '"Skřeti" → "Škriatkovia" (orci)',
    '"Skuruti" → "Uruk-hai"',
    '"Trpaslíci" → "Trpaslíci"',
    '"Elfové" → "Elfovia"',
    '"Hobiti" → "Hobiti"',
    'Tón: praktický, mierne poetický. Oslovuj čitateľa neformálne ("ty").',
  ],
  uk: [
    '"Pán Prstenů" → "Володар Перснів"',
    '"Bitva o Středozem" → "Битва за Середзем\'я"',
    '"Středozem" → "Середзем\'я"',
    '"Křtiny", "Bukovina" → залишити (назви населених пунктів)',
    '"larp" → "ЛАРП" or "LARP"',
    '"frakce", "armáda" → "фракція", "армія"',
    '"strana" → "сторона"',
    '"kostým" → "костюм"',
    '"zbraň", "zbroj" → "зброя", "обладунок"',
    '"životy" → "життя"',
    '"smrtelně raněn(a)" → "смертельно поранений(а)"',
    '"organizátor" → "організатор"',
    '"účastník" → "учасник"',
    '"hráč" → "гравець"',
    '"Jezdci Rohanu" → "Вершники Рогану"',
    '"Bílý strom" → "Біле Дерево"',
    '"Svobodné národy" → "Вільні Народи"',
    '"Síly Temného pána" → "Сили Темного Володаря"',
    '"Skřeti" → "Орки"',
    '"Skuruti" → "Урук-хай"',
    '"Trpaslíci" → "Гноми"',
    '"Elfové" → "Ельфи"',
    '"Hobiti" → "Гобіти"',
    'Тон: практичний, дещо поетичний. Звертайся до читача неформально ("ти").',
  ],
};

/* ────────────────────────────────────────────────────────── tree helpers */

const flattenWithPaths = (obj, prefix = '', out = {}) => {
  if (obj == null) return out;
  if (typeof obj === 'string') { out[prefix] = obj; return out; }
  if (typeof obj === 'number' || typeof obj === 'boolean') return out;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenWithPaths(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      flattenWithPaths(obj[k], prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
};

const setByPath = (obj, path, value) => {
  // Path tokens like `chapters[2].body_html`
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

const SKIP_KEY_RE = /(^|\.)(id|icon|href|url|src|slug|key|image_url|image|video_id|color|bg_color|bg|emblem|photo|date|datetime|cookie_name|provider|category|type|order|priority|class|className|status|format|target|rel|role|placeholder)$/i;

const isIdentifierValue = (v) => {
  if (typeof v !== 'string') return true;
  const s = v.trim();
  if (!s) return true;
  if (/^https?:\/\//.test(s)) return true;
  if (/^mailto:/.test(s)) return true;
  if (/^\/[a-z0-9/_-]*\/?$/i.test(s)) return true;
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return true;
  if (/^(lucide|game-icons|material-symbols):/i.test(s)) return true;
  if (/^[a-z][a-z0-9_-]{0,30}$/.test(s)) return true;
  if (/^[A-Za-z0-9_-]{11}$/.test(s) && !/\s/.test(s)) return true;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return true;
  if (/^\d+$/.test(s)) return true;
  return false;
};

/* ────────────────────────────────────────────────────────── API */

const callClaude = async (lang, batch) => {
  // batch: { [key]: csValue }
  const glossary = GLOSSARY[lang].map((g) => `  - ${g}`).join('\n');
  const items = Object.entries(batch);
  const numbered = items.map(([k, v], i) => `${i + 1}. ${JSON.stringify(v)}`).join('\n');

  const system = `You are a professional translator for a Czech LARP (live-action role-playing) event website about Lord of the Rings — Battle for Middle-earth.

Your task: translate Czech text into ${LANG_NAMES[lang]}.

RULES:
- Preserve ALL HTML tags (<p>, <strong>, <a href="...">, <ul>, <li>, <h2>, etc.) EXACTLY as they are. Only translate the visible text content between tags.
- Preserve placeholders/variables inside curly braces like {year}, {count}, {name}.
- Preserve Czech place names: Křtiny, Bukovina, Brno, Morava (use local conventions if applicable).
- Preserve URLs and href values exactly.
- Output ONLY a JSON object mapping the input number (as string) to the translated string. No explanation, no markdown wrapper, just JSON.

GLOSSARY (use these specific translations consistently):
${glossary}`;

  const user = `Translate the following ${items.length} Czech strings into ${LANG_NAMES[lang]}. Return JSON: {"1": "translated1", "2": "translated2", ...}.

${numbered}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText.slice(0, 500)}`);
  }
  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';
  // Hledáme JSON v odpovědi
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd < 0) {
    throw new Error('No JSON in response: ' + text.slice(0, 300));
  }
  let parsed;
  try {
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${e.message}; text was: ${text.slice(0, 500)}`);
  }
  // Mapování zpět na klíče
  const result = {};
  for (const [k] of items) {
    const idx = items.findIndex(([kk]) => kk === k) + 1;
    if (parsed[idx] !== undefined || parsed[String(idx)] !== undefined) {
      result[k] = parsed[idx] ?? parsed[String(idx)];
    }
  }
  return { translations: result, usage: data.usage };
};

/* ────────────────────────────────────────────────────────── main */

const main = async () => {
  const status = JSON.parse(await readFile(join(ROOT, 'src/data/translation-status.json'), 'utf8'));
  const pageDir = (slug) => join(ROOT, 'src/content/pages', slug);

  let totalTranslated = 0;
  let totalCost = 0;
  let totalApiCalls = 0;

  for (const lang of TARGET_LANGS) {
    const pages = Object.entries(status.pages?.[lang] ?? {})
      .filter(([_, v]) => v.pct < 100)
      .sort((a, b) => a[1].pct - b[1].pct);

    console.log(`\n═══ ${lang.toUpperCase()} — ${pages.length} page(s) to translate ═══`);

    for (const [_, info] of pages) {
      if (ONLY_PAGE && info.slug !== ONLY_PAGE) continue;
      if (totalTranslated >= LIMIT) {
        console.log(`  → LIMIT ${LIMIT} reached, stopping.`);
        break;
      }

      const cs = JSON.parse(await readFile(join(pageDir(info.slug), 'cs.json'), 'utf8'));
      const targetPath = join(pageDir(info.slug), `${lang}.json`);
      let target;
      try { target = JSON.parse(await readFile(targetPath, 'utf8')); }
      catch { target = JSON.parse(JSON.stringify(cs)); }  // start from cs structure

      // Najdi klíče k překladu
      const csFlat = flattenWithPaths(cs);
      const tFlat = flattenWithPaths(target);
      const toTranslate = {};
      for (const [k, v] of Object.entries(csFlat)) {
        if (typeof v !== 'string') continue;
        if (SKIP_KEY_RE.test(k)) continue;
        if (isIdentifierValue(v)) continue;
        if (tFlat[k] === v || tFlat[k] === undefined) toTranslate[k] = v;
      }
      const keys = Object.keys(toTranslate);
      if (keys.length === 0) continue;

      console.log(`\n  ${info.slug} (${info.pct}%) — ${keys.length} string(s) to translate`);

      if (DRY) {
        console.log('    (dry-run, no API call)');
        totalTranslated += keys.length;
        continue;
      }

      // Batch translations — 30 strings per call, but cap at ~10k chars input
      const BATCH_SIZE = 30;
      const BATCH_CHARS = 12000;
      let i = 0;
      while (i < keys.length) {
        const batch = {};
        let chars = 0;
        let count = 0;
        while (i < keys.length && count < BATCH_SIZE && chars < BATCH_CHARS) {
          batch[keys[i]] = toTranslate[keys[i]];
          chars += toTranslate[keys[i]].length;
          count++;
          i++;
        }

        process.stdout.write(`    batch ${count} strings (~${chars} chars)... `);
        try {
          const { translations, usage } = await callClaude(lang, batch);
          for (const [k, t] of Object.entries(translations)) {
            setByPath(target, k, t);
          }
          totalTranslated += Object.keys(translations).length;
          totalApiCalls++;
          // Sonnet 4.5 pricing: $3/M input, $15/M output
          const cost = (usage.input_tokens / 1e6) * 3 + (usage.output_tokens / 1e6) * 15;
          totalCost += cost;
          console.log(`✓ ${Object.keys(translations).length} done · $${cost.toFixed(4)}`);
        } catch (e) {
          console.log(`✗ ${e.message}`);
          break;
        }
      }

      // Zapiš target
      if (!DRY) await writeFile(targetPath, JSON.stringify(target, null, 2) + '\n', 'utf8');

      if (totalTranslated >= LIMIT) break;
    }

    if (totalTranslated >= LIMIT) break;
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  Translated: ${totalTranslated} strings · ${totalApiCalls} API calls · est. $${totalCost.toFixed(2)}`);
  console.log(`  ${DRY ? '(DRY RUN — no files written)' : 'Files updated.'}`);
  console.log(`  Pusť teď: \`npm run audit:i18n\` pro ověření, pak \`npm run build\` pro nový build`);
  console.log(`═══════════════════════════════════════════════════════════`);
};

main().catch((e) => {
  console.error('✗ auto-translate failed:', e);
  process.exit(1);
});
