#!/usr/bin/env node
/**
 * generate-llms.mjs — generátor public/llms.txt + public/llms-full.txt
 * Datum: 2026-05-11 (velká revize 2026-08-14)
 *
 * Účel: poskytnout AI nástrojům (Claude, ChatGPT, Perplexity, Gemini, …)
 * strojově přívětivý plný text obsahu webu Pán Prstenů — bez nutnosti
 * crawlovat HTML, JS a iframe.
 *
 * Konvence dle llmstxt.org:
 *   - llms.txt — krátký rozcestník s odkazy na hlavní stránky
 *   - llms-full.txt — kompletní text všech stránek (čeština = primární)
 *
 * ── Revize 2026-08-14 ──────────────────────────────────────────────────
 * Předchozí verze měla tři třídy vad, které z llms.txt dělaly nedůvěryhodný
 * zdroj (a AI nástroj, kterému jednou vrátíme 404, si soubor odloží):
 *
 *   1) HARDCODED FAKTA byla zastaralá — místo konání „Křtiny/Bukovina"
 *      a GPS 49.29895, 16.75916 z dřívějšího tábořiště, „9 frakcí" bez
 *      nové frakce Žoldáci. Nově se všechno tahá z `src/content/site/event/`
 *      (meta.json) a ze skutečných YAML frakcí.
 *
 *   2) URL SE HÁDALY z cesty k obsahovému JSONu (`src/content/pages/<x>/cs.json`
 *      → `/cs/<x>/`). Osiřelé obsahové složky (kostymove-inspirace, inspiromat,
 *      navody-pro-novacky, vyroba-zbrani-a-vybaveni, registrace/vypisy) tak
 *      generovaly odkazy na neexistující stránky — 5 mrtvých URL v rozcestníku.
 *      Nově se každá URL ověřuje proti reálným routám v `src/pages/`.
 *
 *   3) V ROZCESTNÍKU CHYBĚLY celé sekce: detaily frakcí (9 stránek),
 *      encyklopedie Světa Středozemě, dlouhé právní texty (pages-long),
 *      inspiromat armád a stránky statistik. Zároveň tam prosákly artefakty
 *      typu `[object Object]` a nenahrazený placeholder `{year}`.
 *
 * Spuštění:
 *   node scripts/generate-llms.mjs      (běží automaticky v `npm run build`)
 */

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
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

/* ────────────────────────────────────────────────────────────────────────── */
/* Route discovery — které URL na webu SKUTEČNĚ existují                      */

/**
 * Cesty s `<meta name="robots" content="noindex">` — redirect stuby a živé
 * výpisy z API. Musí zůstat mimo llms.txt i mimo sitemapu.
 * Zrcadlí `NOINDEX_PATTERNS` v astro.config.mjs — při změně upravit obojí.
 */
const NOINDEX_PATTERNS = [
  /^\/(403|404|500)\/$/,
  /^\/registrace\/formular\/$/,
  /^\/registrace\/osobni-karta\/$/,
  /^\/registrace\/statistiky\//,
  /^\/registrace\/vypisy\//,
];

const isNoIndexPath = (p) => NOINDEX_PATTERNS.some((re) => re.test(p));

/**
 * Projde `src/pages/[lang]/` a vrátí množinu statických rout bez jazykového
 * prefixu (`/faq/`, `/svet-stredozeme/mistopis/`, …). Dynamické segmenty
 * (`[slug]`, `[army]`, `[rok]`, `[typ]`) se doplňují zvlášť, protože jejich
 * hodnoty známe až z obsahu (frakce, novinky, armády inspiromatu, ročníky).
 */
const collectStaticRoutes = async () => {
  const base = join(ROOT, 'src/pages/[lang]');
  const routes = new Set(['/']);
  const walk = async (dir, prefix) => {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (e.name.startsWith('[')) continue; // dynamické — řešíme explicitně
        await walk(join(dir, e.name), `${prefix}${e.name}/`);
      } else if (e.name.endsWith('.astro') && !e.name.startsWith('[')) {
        routes.add(e.name === 'index.astro' ? prefix : `${prefix}${e.name.replace(/\.astro$/, '')}/`);
      }
    }
  };
  await walk(base, '/');
  return routes;
};

/**
 * `src/content/pages/<slug>/cs.json` → `/cs/<slug>/`, ale jen když taková
 * routa opravdu existuje. Osiřelé obsahové složky (zbytky po refactoru)
 * vrací `null` místo mrtvého odkazu.
 */
const urlFromPagePath = (path, routes) => {
  const rel = relative(join(ROOT, 'src/content/pages'), path).replace(/[\\/]+/g, '/');
  if (rel.startsWith('_home/')) return '/cs/';
  if (rel.startsWith('_root/')) return null; // error stránky vyřadit
  const slug = rel.replace(/\/cs\.json$/, '');
  const routePath = `/${slug}/`;
  if (!routes.has(routePath) || isNoIndexPath(routePath)) return null;
  return `/cs${routePath}`;
};

/**
 * Bezpečný výběr titulku/popisu z obsahového JSONu.
 * Dřív se používal řetězec `??` fallbacků bez typové kontroly, takže když
 * byl `meta` objekt (a ne `{title}`), skončil v llms.txt doslova jako
 * `[object Object]`. Bereme jen neprázdné řetězce a zahazujeme šablony
 * s nenahrazenými placeholdery (`{year}`) — ty patří dynamickým routám,
 * které se do rozcestníku přidávají zvlášť s dosazenou hodnotou.
 */
const firstString = (...candidates) => {
  for (const c of candidates) {
    if (typeof c !== 'string') continue;
    const t = c.trim();
    if (!t || /\{[a-z_]+\}/i.test(t)) continue;
    return t;
  }
  return null;
};

const pickTitle = (d) =>
  firstString(d?.meta?.title, d?.meta_title, d?.hero?.h1, d?.title, d?.breadcrumb, d?.bc_label, d?.tag);

const pickDesc = (d) =>
  firstString(d?.meta?.description, d?.meta_description, d?.description, d?.hero?.subtitle, d?.desc, d?.subtitle);

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
  const routes = await collectStaticRoutes();

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

  /* ─── Fakta o akci — single source of truth, žádné hardcode ─── */
  const eventMeta = JSON.parse(await readFile(join(ROOT, 'src/content/site/event/meta.json'), 'utf8'));
  const eventCs = JSON.parse(await readFile(join(ROOT, 'src/content/site/event/cs.json'), 'utf8'));

  /* ─── Frakce — načteme jednou, použijeme v rozcestníku i v plném textu ─── */
  const factionData = [];
  for (const f of factions) {
    const id = f.split('/').pop().replace(/\.ya?ml$/, '');
    try {
      const data = parseYaml(await readFile(f, 'utf8'));
      factionData.push({ id, data });
    } catch (e) {
      factionData.push({ id, data: null, error: e.message });
    }
  }
  const visibleFactions = factionData.filter((f) => f.data && !f.data.hidden);
  const factionNames = (side) =>
    visibleFactions
      .filter((f) => f.data.side === side)
      .map((f) => f.data?.i18n?.cs?.name ?? f.id);

  /* ─── Build llms-full.txt ─── */
  const full = [];
  full.push('# Pán Prstenů — Bitva o Středozem — kompletní obsah webu');
  full.push('');
  full.push(`> Vygenerováno: ${new Date().toISOString().slice(0, 10)} pomocí scripts/generate-llms.mjs`);
  full.push('> Účel: poskytnout AI nástrojům plný text webu bez nutnosti crawlovat HTML/JS.');
  full.push(`> Web: ${SITE} · Termín: ${eventMeta.date_short} · Místo: ${eventMeta.place}`);
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
    const url = urlFromPagePath(f, routes);
    if (!url) continue; // error stránky, noindex a osiřelé obsahové složky
    try {
      const data = JSON.parse(await readFile(f, 'utf8'));
      const title = pickTitle(data) ?? url;
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

  /* Frakce — počty i názvy odvozené z YAML, skryté frakce vynechané */
  full.push('## Armády a strany (frakce)');
  full.push('');
  full.push(
    `Web nabízí ${visibleFactions.length} veřejných frakcí — ` +
      `svobodné národy (${factionNames('free').join(', ')}), ` +
      `síly Temného pána (${factionNames('evil').join(', ')})` +
      (factionNames('mercenary').length
        ? ` a žoldnéřské frakce mimo obě strany (${factionNames('mercenary').join(', ')}).`
        : '.')
  );
  full.push('');
  for (const { id, data, error } of factionData) {
    if (error) {
      full.push(`### ${id} (chyba parsování: ${error})`);
      full.push('');
      continue;
    }
    if (data.hidden) continue; // skryté frakce nepatří do veřejného indexu
    const block = formatFaction(id, data);
    if (block) {
      full.push(block);
      full.push(`URL: ${SITE}/cs/frakce/${id}/`);
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
  const seen = new Set();
  const addPage = (url, title, desc) => {
    if (!url || !title || seen.has(url)) return;
    seen.add(url);
    pageList.push({ url, title, desc: desc || null });
  };

  for (const f of pages) {
    const url = urlFromPagePath(f, routes);
    if (!url) continue;
    try {
      const data = JSON.parse(await readFile(f, 'utf8'));
      addPage(url, pickTitle(data), pickDesc(data));
    } catch { /* skip */ }
  }

  /* Dlouhé právní a referenční texty (pages-long) — dřív v rozcestníku chyběly,
     přitom jde o podmínky účasti, GDPR, cookies a průvodce pro nováčky. */
  for (const f of pagesLong) {
    const slug = relative(join(ROOT, 'src/content/pages-long'), f)
      .replace(/[\\/]+/g, '/')
      .replace(/\/cs\.md$/, '');
    if (!routes.has(`/${slug}/`)) continue;
    const raw = await readFile(f, 'utf8');
    const fmTitle = raw.match(/^---[\s\S]*?title:\s*(['"]?)(.+?)\1[\s\S]*?---/m);
    const fmDesc = raw.match(/^---[\s\S]*?description:\s*(['"]?)(.+?)\1\s*$/m);
    addPage(`/cs/${slug}/`, fmTitle ? fmTitle[2] : slug, fmDesc ? fmDesc[2] : null);
  }

  /* Detaily frakcí — 9 stránek, v rozcestníku dosud úplně chyběly.
     Právě na ně míří dotazy typu „za koho můžu na Pánu Prstenů hrát". */
  for (const { id, data } of visibleFactions) {
    const cs = data?.i18n?.cs;
    if (!cs?.name) continue;
    addPage(`/cs/frakce/${id}/`, `${cs.name} — armáda`, cs.tagline ?? null);
  }

  /* Inspiromat armád — dynamická routa /navody-a-inspirace/inspiromat/[army]/ */
  try {
    const insp = JSON.parse(await readFile(join(ROOT, 'src/content/pages/inspiromat/cs.json'), 'utf8'));
    for (const army of insp.armies ?? []) {
      if (!army.available) continue;
      addPage(
        `/cs/navody-a-inspirace/inspiromat/${army.id}/`,
        `Inspiromat — ${army.title}`,
        `Fotogalerie kostýmů z předchozích ročníků: ${army.title}.`
      );
    }
  } catch { /* inspiromat data nejsou povinná */ }

  /* Demografie po ročnících — dynamická routa /minule-rocniky/statistiky/[rok]/ */
  try {
    const yearDir = join(ROOT, 'src/content/pages/minule-rocniky/statistiky/charts');
    const years = (await readdir(yearDir))
      .map((n) => n.match(/^(\d{4})/)?.[1])
      .filter(Boolean);
    for (const y of [...new Set(years)].sort()) {
      addPage(
        `/cs/minule-rocniky/statistiky/${y}/`,
        `Demografie účastníků ${y}`,
        `Statistiky ročníku ${y} — armády, věk, pohlaví, zbraně, dynamika registrací.`
      );
    }
  } catch { /* grafy nejsou povinné */ }
  addPage(
    '/cs/minule-rocniky/statistiky/srovnani/',
    'Srovnání ročníků',
    'Mezi-ročníkové srovnání demografie účastníků larpu Pán Prstenů.'
  );

  /* Stránky bez vlastního obsahového JSONu (generují se z navigace / kolekcí). */
  addPage(
    '/cs/mapa-webu/',
    'Mapa webu',
    'Hierarchický přehled všech sekcí webu — hlavní navigace, frakce, role na akci a právní stránky.'
  );
  addPage('/cs/galerie/', 'Galerie', 'Fotografie a vzpomínky z předchozích ročníků Bitvy o Středozem.');
  addPage(
    '/cs/novinky/rss.xml',
    'RSS — Novinky',
    'RSS feed sekce novinek pro AI nástroje a feed readery.'
  );

  pageList.sort((a, b) => a.url.localeCompare(b.url));

  const short = [];
  short.push('# Pán Prstenů — Bitva o Středozem');
  short.push('');
  short.push(
    `> Larpová bitva ve světě J. R. R. Tolkiena. ${eventMeta.date_short}, ${eventMeta.place} ` +
      `(${eventCs.region}), ${eventMeta.participants} účastníků. Pořádá Moravian LARP, z. s.`
  );
  short.push('');
  short.push(`Pro AI nástroje: kompletní obsah webu v jednom souboru je na **[/llms-full.txt](${SITE}/llms-full.txt)**.`);
  short.push('');
  short.push('## Pořadatel');
  short.push('- Moravian LARP, z. s. · IČO 22669167 · L 12656 KS Brno');
  short.push('- Sídlo: Starobrněnská 289/7, 602 00 Brno');
  short.push(`- E-mail: info@panprstenu.cz · Web: ${SITE}`);
  short.push('');
  short.push('## Základní fakta');
  short.push(`- Termín: ${eventMeta.date_short} (${eventCs.date_full}). Hlavní bitva: ${eventCs.main_game_day} 22. 8. 2026.`);
  short.push(`- Místo: ${eventMeta.place}, ${eventCs.region}. GPS ${eventMeta.gps}.`);
  short.push(`- Účastníci: ${eventMeta.participants} (${eventCs.participants_note}). Věk: hlavní hra od ${eventMeta.age}, dětská hra ${eventMeta.kids_age}.`);
  short.push(`- Registrace: přes ${eventCs.registration_system}. Platba do ${eventMeta.payment_due_days} dní od registrace.`);
  short.push(`- Registrační poplatek hrajícího účastníka: 850 Kč do 30. 6. 2026, 950 Kč do 17. 8. 2026, 1 100 Kč od 18. 8. 2026 a na místě.`);
  short.push(
    `- ${visibleFactions.length} veřejných frakcí — svobodné národy: ${factionNames('free').join(', ')}; ` +
      `síly Temna: ${factionNames('evil').join(', ')}` +
      (factionNames('mercenary').length
        ? `; mimo obě strany: ${factionNames('mercenary').join(', ')}.`
        : '.')
  );
  short.push('- Stravování organizátoři nezajišťují; na místě je domluvená hospoda U Zeleného draka.');
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
  short.push('- WebPage — meta každé stránky; BreadcrumbList — hierarchie (jeden blok na stránku)');
  short.push('- Event + subEvent (hlavní sobotní bitva) — na úvodní stránce, včetně Place s GPS a Offer s registračním poplatkem');
  short.push('- FAQPage — úvodní stránka a stránky s Q&A blokem');
  short.push('- NewsArticle — stránky novinek');
  short.push('- DefinedTermSet — Slovníček pojmů (188 hesel)');
  short.push('- ItemList — Místopis, Národy, Království a říše, Časová linka');
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
