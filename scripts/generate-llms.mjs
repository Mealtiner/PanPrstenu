#!/usr/bin/env node
/**
 * generate-llms.mjs — generátor public/llms.txt + public/llms-full.txt
 * Datum: 2026-05-11
 *
 * Účel: poskytnout AI nástrojům (Claude, ChatGPT, Perplexity, Gemini, …)
 * strojově přívětivý plný text obsahu webu Pán Prstenů — bez nutnosti
 * crawlovat HTML, JS a iframe.
 *
 * Konvence dle llmstxt.org:
 *   - llms.txt — krátký rozcestník s odkazy na hlavní stránky
 *   - llms-full.txt — kompletní text všech stránek (čeština = primární)
 *
 * Spuštění:
 *   node scripts/generate-llms.mjs
 *
 * Volá se i ručně. Lze přidat do package.json jako `gen:llms`
 * nebo do prebuild hooku (`prebuild`) — zatím necháváme manuální.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://www.panprstenu.cz';

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                    */

const stripHtml = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const stripMd = (md) =>
  String(md ?? '')
    .replace(/^---[\s\S]*?---\s*/m, '') // frontmatter
    .replace(/`{1,3}[^`]*`{1,3}/g, '')   // inline code
    .replace(/!\[[^\]]*]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1') // links → text
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // bold/italic
    .replace(/^#+\s*/gm, '') // headings → text
    .replace(/^>\s*/gm, '')  // blockquotes
    .replace(/^-\s*/gm, '• ') // bullets
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const recurseFiles = async (dir) => {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...await recurseFiles(full));
    else out.push(full);
  }
  return out;
};

const urlFromPagePath = (path) => {
  // src/content/pages/<slug>/cs.json → /cs/<slug>/
  // src/content/pages/_home/cs.json → /cs/
  // src/content/pages/_root/404/cs.json → /404/ (skipnem)
  // src/content/pages/role/stankari/cs.json → /cs/spoluprace/stankari/ — neumíme bez navigation.ts.
  //   Pro účely llms použijeme generickou cestu /cs/<segments>/
  const rel = relative(join(ROOT, 'src/content/pages'), path).replace(/[\\/]+/g, '/');
  if (rel.startsWith('_home/')) return '/cs/';
  if (rel.startsWith('_root/')) return null; // error stránky vyřadit
  const slug = rel.replace(/\/cs\.json$/, '');
  return `/cs/${slug}/`;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Page JSON — rekurzivní extrakce textových polí                             */

const KEEP_KEYS_TO_LABEL = new Set([
  'title', 'h1', 'h2', 'h3', 'h4', 'heading', 'subheading', 'subtitle',
  'description', 'lede', 'body', 'body_html', 'text', 'content',
  'items', 'item', 'paragraphs', 'paragraph',
  'question', 'answer', 'q', 'a',
  'label', 'note', 'value', 'name', 'tagline', 'hint', 'hook',
  'meta', 'breadcrumb', 'hero', 'must_know', 'chapters',
  'sections', 'cards', 'card', 'list', 'tabs', 'tab',
  'cta', 'cta_title', 'cta_text', 'cta_label', 'cta_body',
]);

// Klíče, které jsou čistě UI/technical a do llms.txt nepatří
const SKIP_KEY_PATTERNS = [
  /^(class|className|icon|tone|variant|color|colors|aria|aria_.+|alt|href|url|src|image|image_.+|id|key|slug|date|datetime|order|priority|format|target|rel|role|placeholder|footer_note|search_.+|expand_all|collapse_all|.*_aria|empty_.+|counter_.+)$/i,
  /^(open|closed|visible|hidden|featured|external|new_tab)$/i,
];

const isSkipKey = (k) => SKIP_KEY_PATTERNS.some((re) => re.test(k));

// Recursively walk an object and collect human-readable strings.
// Returns plain text with light structure (newlines between fields).
const extractFromJson = (node, depth = 0) => {
  if (node == null) return '';
  if (typeof node === 'string') {
    const t = node.trim();
    if (!t) return '';
    // body_html → strip HTML
    if (/<[a-z]/i.test(t)) return stripHtml(t);
    return t;
  }
  if (typeof node === 'number' || typeof node === 'boolean') return String(node);
  if (Array.isArray(node)) {
    const parts = node.map((v) => extractFromJson(v, depth + 1)).filter(Boolean);
    return parts.join('\n');
  }
  if (typeof node === 'object') {
    const parts = [];
    for (const [k, v] of Object.entries(node)) {
      if (isSkipKey(k)) continue;
      const txt = extractFromJson(v, depth + 1);
      if (!txt) continue;
      // Pokud má klíč význam (title, q, a, ...), zachováme jeho roli
      if (KEEP_KEYS_TO_LABEL.has(k) || /^(title|h\d|heading|subtitle|subheading|name)$/i.test(k)) {
        parts.push(txt);
      } else {
        parts.push(txt);
      }
    }
    return parts.join('\n');
  }
  return '';
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Faction YAML formatter                                                     */

const formatFaction = (id, data) => {
  const cs = data?.i18n?.cs;
  if (!cs) return '';
  const side = data.side === 'free' ? 'Svobodný národ Středozemě'
    : data.side === 'evil' ? 'Síly Temného pána'
    : data.side ?? '';
  const lines = [];
  lines.push(`### ${cs.name ?? id} (${side})`);
  if (cs.tagline) lines.push(cs.tagline);
  if (Array.isArray(cs.combat_style) && cs.combat_style.length)
    lines.push(`Styl boje: ${cs.combat_style.join(', ')}.`);
  if (Array.isArray(cs.recommended_for) && cs.recommended_for.length)
    lines.push(`Doporučeno pro: ${cs.recommended_for.join(', ')}.`);
  if (Array.isArray(cs.not_recommended_for) && cs.not_recommended_for.length)
    lines.push(`Není vhodné pro: ${cs.not_recommended_for.join(', ')}.`);
  if (Array.isArray(cs.tags) && cs.tags.length)
    lines.push(`Tagy: ${cs.tags.join(', ')}.`);
  if (cs.newbie_costume_hint) lines.push(`Tip pro nováčka: ${cs.newbie_costume_hint}`);
  if (cs.camp_hook) lines.push(`Tábor: ${cs.camp_hook}`);
  if (cs.costume_colors_text) lines.push(`Barvy: ${cs.costume_colors_text}`);
  if (cs.heraldry_text) lines.push(`Heraldika: ${cs.heraldry_text}`);
  if (cs.ruler?.name) {
    const r = cs.ruler;
    lines.push(`Vůdce: ${r.name}${r.title ? ' — ' + r.title : ''}.${r.description ? ' ' + r.description : ''}`);
  }
  if (Array.isArray(cs.lore_sections)) {
    for (const sec of cs.lore_sections) {
      if (sec.title) lines.push(`\n**${sec.title}**`);
      if (Array.isArray(sec.paragraphs)) {
        for (const p of sec.paragraphs) lines.push(p);
      }
    }
  }
  return lines.join('\n');
};

/* ────────────────────────────────────────────────────────────────────────── */
/* i18n cs.json — content key whitelist                                       */

const I18N_CONTENT_PREFIXES = [
  'site.', 'hero.', 'quicklinks.', 'why.', 'factions.heading', 'factions.subheading',
  'factions.free', 'factions.evil', 'factions.mercenary',
  'program.', 'whatsexpected.', 'reg_box.', 'gallery.heading', 'home.teaser.',
  'faq.heading', 'faq.subheading', 'faq.q', 'faq.a',
  'mega.world.cta_title', 'mega.world.cta_text',
  'mega.practical.cta_title', 'mega.practical.cta_text',
  'mega.community.cta_title', 'mega.community.cta_text',
  'mega.collaboration.cta_title', 'mega.collaboration.cta_text', 'mega.collaboration.cta_label',
  'event_facts.', 'registrace_cta.', 'video_gallery.heading', 'video_gallery.subtitle',
  'video_gallery.v_', 'video_gallery.trailer_', 'video_gallery.badge_',
  'drawer.checklist.', 'drawer.newcomer.', 'drawer.link.',
  'whyjoin.', 'gallery_section.',
];

const isI18nContentKey = (key) =>
  I18N_CONTENT_PREFIXES.some((p) => key === p.replace(/\.$/, '') || key.startsWith(p));

const formatI18nSection = (i18n) => {
  const groups = {};
  for (const [k, v] of Object.entries(i18n)) {
    if (typeof v !== 'string' || !v.trim()) continue;
    if (!isI18nContentKey(k)) continue;
    const prefix = k.split('.')[0];
    (groups[prefix] = groups[prefix] || []).push([k, v]);
  }
  const out = [];
  const order = ['site', 'hero', 'quicklinks', 'why', 'factions', 'program', 'whatsexpected',
    'reg_box', 'event_facts', 'registrace_cta', 'home', 'whyjoin', 'gallery', 'gallery_section',
    'mega', 'faq', 'video_gallery', 'drawer'];
  for (const g of order) {
    if (!groups[g]) continue;
    out.push(`\n### ${g}`);
    for (const [k, v] of groups[g]) out.push(`${k}: ${v}`);
  }
  return out.join('\n');
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Main                                                                       */

const main = async () => {
  const pages = (await recurseFiles(join(ROOT, 'src/content/pages')))
    .filter((p) => p.endsWith('/cs.json'))
    .sort();

  const pagesLong = (await recurseFiles(join(ROOT, 'src/content/pages-long')))
    .filter((p) => p.endsWith('/cs.md'))
    .sort();

  const factions = (await recurseFiles(join(ROOT, 'src/content/factions')))
    .filter((p) => p.endsWith('.yml'))
    .sort();

  const news = (await recurseFiles(join(ROOT, 'src/content/news/cs')))
    .filter((p) => p.endsWith('.md'))
    .sort();

  const i18nCs = JSON.parse(await readFile(join(ROOT, 'src/i18n/ui/cs.json'), 'utf8'));

  /* ─── Build llms-full.txt ─── */
  const full = [];
  full.push('# Pán Prstenů — Bitva o Středozem — kompletní obsah webu');
  full.push('');
  full.push(`> Vygenerováno: ${new Date().toISOString().slice(0, 10)} pomocí scripts/generate-llms.mjs`);
  full.push('> Účel: poskytnout AI nástrojům plný text webu bez nutnosti crawlovat HTML/JS.');
  full.push('> Web: https://www.panprstenu.cz · Termín: 20.–23. 8. 2026 · Místo: Křtiny/Bukovina, JM');
  full.push('');
  full.push('---');
  full.push('');

  /* I18N obsahové klíče (homepage sekce: hero, why, program, FAQ, event facts, …) */
  full.push('## Globální obsah (homepage, FAQ, CTA, video galerie)');
  full.push('');
  full.push('Tyto texty se zobrazují napříč webem, primárně na úvodní stránce a v dílčích sekcích.');
  full.push('');
  full.push(formatI18nSection(i18nCs));
  full.push('');
  full.push('---');
  full.push('');

  /* Stránky (pages/*) */
  full.push('## Jednotlivé stránky');
  full.push('');
  for (const f of pages) {
    const url = urlFromPagePath(f);
    if (!url) continue; // error stránky vyřazené
    try {
      const data = JSON.parse(await readFile(f, 'utf8'));
      const title = data?.meta?.title ?? data?.hero?.h1 ?? data?.breadcrumb ?? url;
      full.push(`### ${title}`);
      full.push(`URL: ${SITE}${url}`);
      const text = extractFromJson(data).trim();
      if (text) full.push(text);
      full.push('');
    } catch (e) {
      full.push(`### ${url} (chyba parsování: ${e.message})`);
      full.push('');
    }
  }
  full.push('---');
  full.push('');

  /* Pages-long (cookies, gdpr, podminky-ucasti, pro-novacky) */
  full.push('## Dlouhé právní a referenční texty');
  full.push('');
  for (const f of pagesLong) {
    const rel = relative(join(ROOT, 'src/content/pages-long'), f).replace(/[\\/]+/g, '/');
    const slug = rel.replace(/\/cs\.md$/, '');
    const url = `${SITE}/cs/${slug}/`;
    const raw = await readFile(f, 'utf8');
    // Extract title from frontmatter if present
    const fmTitle = raw.match(/^---[\s\S]*?title:\s*(['"]?)(.+?)\1[\s\S]*?---/m);
    const title = fmTitle ? fmTitle[2] : slug;
    full.push(`### ${title}`);
    full.push(`URL: ${url}`);
    full.push(stripMd(raw));
    full.push('');
  }
  full.push('---');
  full.push('');

  /* Frakce */
  full.push('## Armády a strany (frakce)');
  full.push('');
  full.push('Web nabízí 9 frakcí — 4 svobodné národy + 5 sil Temného pána.');
  full.push('');
  for (const f of factions) {
    const id = f.split('/').pop().replace(/\.ya?ml$/, '');
    try {
      const data = parseYaml(await readFile(f, 'utf8'));
      const block = formatFaction(id, data);
      if (block) {
        full.push(block);
        full.push(`URL: ${SITE}/cs/frakce/${id}/`);
        full.push('');
      }
    } catch (e) {
      full.push(`### ${id} (chyba parsování: ${e.message})`);
      full.push('');
    }
  }
  full.push('---');
  full.push('');

  /* Novinky */
  if (news.length) {
    full.push('## Novinky');
    full.push('');
    for (const f of news) {
      const slug = f.split('/').pop().replace(/\.md$/, '');
      const raw = await readFile(f, 'utf8');
      const fmTitle = raw.match(/^---[\s\S]*?title:\s*(['"]?)(.+?)\1[\s\S]*?---/m);
      const fmDate = raw.match(/^---[\s\S]*?(?:date|publishDate):\s*['"]?(\d{4}-\d{2}-\d{2})/m);
      const title = fmTitle ? fmTitle[2] : slug;
      full.push(`### ${title}${fmDate ? ` (${fmDate[1]})` : ''}`);
      full.push(`URL: ${SITE}/cs/novinky/${slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')}/`);
      full.push(stripMd(raw));
      full.push('');
    }
    full.push('---');
    full.push('');
  }

  full.push('## Pořadatel');
  full.push('');
  full.push('Moravian LARP, z. s.');
  full.push('IČO: 22669167');
  full.push('Spisová značka: L 12656 (Krajský soud v Brně)');
  full.push('Sídlo: Starobrněnská 289/7, 602 00 Brno');
  full.push('E-mail: info@panprstenu.cz');
  full.push('Web: https://www.panprstenu.cz');
  full.push('');
  full.push('## Jazyky');
  full.push('Web má 5 jazyků: cs (primární, plný obsah), en, de, sk, uk (rozpracované překlady).');
  full.push('Strukturní parita všech klíčů napříč jazyky. URL prefix `/cs/`, `/en/`, `/de/`, `/sk/`, `/uk/`.');
  full.push('Tento soubor obsahuje českou (primární) verzi.');

  await writeFile(join(ROOT, 'public/llms-full.txt'), full.join('\n') + '\n', 'utf8');

  /* ─── Build llms.txt (krátký rozcestník) ─── */
  const pageList = [];
  for (const f of pages) {
    const url = urlFromPagePath(f);
    if (!url) continue;
    try {
      const data = JSON.parse(await readFile(f, 'utf8'));
      // Title fallback: meta.title → meta_title → hero.h1 → breadcrumb → title → tag
      const title =
        data?.meta?.title ??
        data?.meta_title ??
        data?.hero?.h1 ??
        data?.breadcrumb ??
        data?.title ??
        data?.bc_label ??
        data?.tag;
      // Description fallback: meta.description → description → hero.subtitle → desc → subtitle
      const desc =
        data?.meta?.description ??
        data?.description ??
        data?.hero?.subtitle ??
        data?.desc ??
        data?.subtitle;
      if (title) pageList.push({ url, title: String(title).trim(), desc: desc ? String(desc).trim() : null });
    } catch { /* skip */ }
  }
  pageList.sort((a, b) => a.url.localeCompare(b.url));

  const short = [];
  short.push('# Pán Prstenů — Bitva o Středozem');
  short.push('');
  short.push('> Larpová bitva ve světě J. R. R. Tolkiena. 20.–23. 8. 2026, louka mezi Křtinami a Bukovinou (Jižní Morava), ~500 účastníků. Pořádá Moravian LARP, z. s.');
  short.push('');
  short.push('Pro AI nástroje: kompletní obsah webu v jednom souboru je na **[/llms-full.txt](https://www.panprstenu.cz/llms-full.txt)**.');
  short.push('');
  short.push('## Pořadatel');
  short.push('- Moravian LARP, z. s. · IČO 22669167 · L 12656 KS Brno');
  short.push('- Sídlo: Starobrněnská 289/7, 602 00 Brno');
  short.push('- E-mail: info@panprstenu.cz · Web: https://www.panprstenu.cz');
  short.push('');
  short.push('## Základní fakta');
  short.push('- Termín: 20.–23. 8. 2026 (čt–ne). Hlavní bitva: sobota 22. 8. 2026.');
  short.push('- Místo: louka mezi Křtinami a Bukovinou, GPS 49.29895, 16.75916.');
  short.push('- Účastníci: ~500. Věk: hlavní hra od 12 let, dětská hra 5–10 let.');
  short.push('- Registrace: přes Registračka.cz. Platba do 10 dní od registrace.');
  short.push('- 9 frakcí: 4 svobodné národy (Gondor, Rohan, Elfové, Trpaslíci) + 5 sil Temna (Skřeti, Skuruti, Harad, Umbar, Vrchovina).');
  short.push('- Akce běží od roku 1992.');
  short.push('');
  short.push('## Hlavní stránky');
  for (const p of pageList) {
    short.push(`- [${p.title}](${SITE}${p.url})${p.desc ? ` — ${p.desc}` : ''}`);
  }
  short.push('');
  short.push('## Jazyky');
  short.push('Web má 5 jazyků: cs (primární), en, de, sk, uk. URL prefix `/cs/`, `/en/`, atd.');
  short.push('');
  short.push('## Schema.org strukturovaná data');
  short.push('- Organization (Moravian LARP) — na všech stránkách');
  short.push('- WebPage, BreadcrumbList — meta každé stránky');
  short.push('- Event — na úvodní stránce (datum, místo, organizátor, popis)');
  short.push('- FAQPage — strukturovaný blok pro FAQ stránku');
  short.push('- NewsArticle — pro stránky novinek/blogu');
  short.push('');
  short.push('## Generování');
  short.push(`Tento soubor je generován automaticky z content collections (\`scripts/generate-llms.mjs\`). Aktualizováno: ${new Date().toISOString().slice(0, 10)}.`);

  await writeFile(join(ROOT, 'public/llms.txt'), short.join('\n') + '\n', 'utf8');

  /* Report */
  const fullSize = (await readFile(join(ROOT, 'public/llms-full.txt'))).length;
  const shortSize = (await readFile(join(ROOT, 'public/llms.txt'))).length;
  console.log(`✓ public/llms.txt        — ${shortSize.toLocaleString()} B  (${pageList.length} stránek v rozcestníku)`);
  console.log(`✓ public/llms-full.txt   — ${fullSize.toLocaleString()} B  (${pages.length} pages + ${pagesLong.length} long + ${factions.length} factions + ${news.length} news)`);
};

main().catch((e) => {
  console.error('✗ generate-llms failed:', e);
  process.exit(1);
});
