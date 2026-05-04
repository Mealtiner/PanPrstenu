# CMS-ready stav stránek

> **Auto-generováno** skriptem [scripts/generate-cms-status.mjs](../scripts/generate-cms-status.mjs)
> Datum: 2026-05-04 07:09:04 UTC
> Pro update: `node --experimental-strip-types scripts/generate-cms-status.mjs`

## Souhrn

- 🟢 **45** ready (texty plně externí, per-lang ve všech 5 jazycích)
- 🟠/🟡 **1** partial (částečně migrováno)
- 🔴 **5** hardcoded (texty stále v .astro)
- ⚪ **4** n/a (redirecty, nemá obsah)

**Celkem stránek:** 55

## Legenda sloupců

- **cs / en / de / sk / uk** — má daná jazyková mutace externí soubor s texty?
  - ✅ má vlastní per-page JSON nebo markdown
  - ❌ texty v .astro hardcoded
  - 🟡 částečně (přes t() z monolithic ui.ts)
  - ⚪ stránka nemá obsah (redirect)
- **t()** — počet `t()` volání v .astro
- **hard.** — počet řádků s českou diakritikou v JSX (ne v t/tp)
- **format** — kde je obsah uložen (json / md / žádné)

## Tabulka

| Stránka | cs | en | de | sk | uk | t() | hard. | format | CMS-ready |
|---|---|---|---|---|---|---|---|---|---|
| `404.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | 0 | json | 🟢 ready |
| `[lang]/403/index.astro` | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | 0 | 0 | — | ⚪ n/a |
| `[lang]/404/index.astro` | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | 0 | 0 | — | ⚪ n/a |
| `[lang]/500/index.astro` | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | 0 | 0 | — | ⚪ n/a |
| `[lang]/bezpecnost/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/cookies/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 2 | 2 | md | 🟠 partial |
| `[lang]/detska-hra/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/faq/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 10 | 0 | json | 🟢 ready |
| `[lang]/fotky-a-video/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/frakce/[slug].astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 50 | 0 | json (parent) | 🟢 ready |
| `[lang]/frakce/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 8 | 0 | json | 🟢 ready |
| `[lang]/galerie/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 4 | 0 | json | 🟢 ready |
| `[lang]/gdpr/index.astro` | ❌ | ❌ | ❌ | ❌ | ❌ | 8 | 313 | — | 🔴 hardcoded |
| `[lang]/hra-a-svet/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | 0 | json | 🟢 ready |
| `[lang]/hra-v-tabore/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | 0 | json | 🟢 ready |
| `[lang]/kdo-jede/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/komunita/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | 0 | json | 🟢 ready |
| `[lang]/kontakt/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/mapa/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/minule-rocniky/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/novinky/[slug].astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json (parent) | 🟢 ready |
| `[lang]/novinky/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 5 | 0 | json | 🟢 ready |
| `[lang]/ohlasy/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/organizacni-informace/index.astro` | ❌ | ❌ | ❌ | ❌ | ❌ | 4 | 272 | — | 🔴 hardcoded |
| `[lang]/podminky-ucasti-a-registrace/index.astro` | ❌ | ❌ | ❌ | ❌ | ❌ | 6 | 228 | — | 🔴 hardcoded |
| `[lang]/podpor-ucastniky/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/poradatel/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 2 | 0 | json | 🟢 ready |
| `[lang]/prakticke-info/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 115 | 0 | json | 🟢 ready |
| `[lang]/prakticky/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | 0 | json | 🟢 ready |
| `[lang]/pravidla/index.astro` | ❌ | ❌ | ❌ | ❌ | ❌ | 6 | 297 | — | 🔴 hardcoded |
| `[lang]/pribeh/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 19 | 0 | json | 🟢 ready |
| `[lang]/pristupnost/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 2 | 0 | json | 🟢 ready |
| `[lang]/pro-media/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/pro-novacky/index.astro` | ❌ | ❌ | ❌ | ❌ | ❌ | 5 | 204 | — | 🔴 hardcoded |
| `[lang]/pro-rodice/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/registrace/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 9 | 0 | json | 🟢 ready |
| `[lang]/registrace/kdyz-je-poplatek-problem/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/role/fotografove-a-kameramani/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/role/hobiti/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/role/nebojovy-doprovod/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/role/organizatori/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/role/pomocnici/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/role/stankari/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/spoluprace/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | 0 | json | 🟢 ready |
| `[lang]/stanky-a-prodejci/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/casova-linka/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/kralovstvi-a-rise/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/mistopis/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/narody/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/slovnicek/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/specificke-jednotky/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 3 | 0 | json | 🟢 ready |
| `[lang]/svet-stredozeme/uvod-do-sveta/index.astro` | ✅ | ✅ | ✅ | ✅ | ✅ | 1 | 0 | json | 🟢 ready |
| `index.astro` | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | 0 | 0 | — | ⚪ n/a |

## Kde jsou texty uložené

### `src/i18n/ui/{lang}.json` — sdílené UI texty
- Krátké, často opakované stringy (nav.*, common.*, footer.*, breadcrumb.*, error.*)
- Volá se přes `t('klíč')`

### `src/content/pages/{slug}/{lang}.json` — per-page JSON obsah
- Strukturovaná data per stránka (meta, hero, sekce, arrays jako items[])
- Volá se přes `getPageData<T>('slug', lang)` nebo `getPageContent('slug', lang)` → `tp('key')`
- Vhodné pro stránky s tabulkami, kartami, grafickými prvky

### `src/content/pages-long/{slug}/{lang}.md` — long-form markdown
- Pro stránky s velkým objemem textu (cookies, gdpr, podmínky atd.)
- Frontmatter pro meta, body je markdown
- Renderuje se přes `<Content />` z astro:content
- Plná podpora WYSIWYG editorů (Sveltia, Decap)

### `src/content/site/event/{lang}.json` — sdílená data o akci
- Termín, místo, popisy faktů
- Volá se přes `getEvent(lang)`

### `src/content/factions/*.yml` — armády (lore data)
- YAML, plánovaná migrace na meta.json + lang.md per audit

## Poznámky pro CMS

Všechny tyto soubory jsou **CMS-ready**:
- Sveltia CMS edituje JSON, YAML i MD nativně, commituje přímo do gitu
- Directus / Payload mohou tyto soubory číst přes Git API nebo importovat do DB
