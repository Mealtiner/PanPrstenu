# Pán Prstenů — Handoff v2.1

**Datum:** 2026-05-04
**Verze:** 2.1.0
**Build:** 302 stránek (47 logických × 5 jazyků + 67 dynamických tras)
**Stav:** 🟢 produkčně nasazeno na main + staging

---

## Stručně co je hotovo

- ✅ **CMS-ready architektura** — všechny texty externalizované v JSON / Markdown
- ✅ **5 jazyků** — strukturní parita (cs / en / de / sk / uk), texty plně přeloženy do shellu, lore data zatím CS placeholder pro non-CS
- ✅ **PageSpeed optimalizace** — explicit image dims, self-hosted fonts, Brotli, HSTS, hero poster + smart video load
- ✅ **Schema.org** — Organization, WebPage, BreadcrumbList, Event, FAQPage, NewsArticle
- ✅ **Hub stránky pro megamenu** — `/hra-a-svet/`, `/prakticky/`, `/komunita/`, `/spoluprace/`
- ✅ **Error stránky** — 404, 500, 403 s Tolkienovskými citáty
- ✅ **Instant root redirect** — `.htaccess` server-side, žádný 2-sec bílý blesk

## Stack

| Vrstva | Technologie | Verze |
|---|---|---|
| Runtime | Node.js | 22.22.2 LTS |
| Generátor | Astro | 6.1.x |
| CSS | Tailwind CSS | 4.2.x (přes `@tailwindcss/vite`) |
| TS | TypeScript | 5.9.x |
| Ikony | astro-icon | 1.1.x (Lucide + Game Icons) |
| MDX | @astrojs/mdx | 5.0.x |
| Sitemap | @astrojs/sitemap | 3.7.x (i18n-aware) |
| Image | Sharp | 0.34.x |

**Žádný React / Svelte / Vue** — vše statické.

---

## Struktura projektu

### Klíčové složky

```
PanPrstenu/
├── astro.config.mjs        Astro 6 konfigurace + i18n
├── src/
│   ├── content.config.ts   Schema pro content collections
│   ├── content/
│   │   ├── pages/          Per-page JSON obsah (/{slug}/{lang}.json)
│   │   ├── pages-long/     Long-form Markdown (legal stránky)
│   │   ├── factions/       Armády (YAML s i18n.{lang}.{...})
│   │   ├── news/           Novinky (per-jazyk MD)
│   │   └── site/event/     Sdílené event data (meta + per-lang)
│   ├── i18n/
│   │   ├── ui.ts           Typed loader pro JSON
│   │   └── ui/{lang}.json  Sdílené UI texty (nav, common, footer, …)
│   ├── lib/content/
│   │   └── pages.ts        Helpery getPageData / getPageContent
│   ├── data/
│   │   ├── event.ts        Loader pro src/content/site/event/
│   │   ├── faq.ts          FAQ data (cca 100 Q&A × 5 jazyků)
│   │   ├── navigation.ts   Megamenu data (hub stránky čerpají odsud)
│   │   └── factionIcons.ts Slug → SVG mapping
│   ├── components/
│   │   ├── ui/             Tlačítka, Input, Tag, Breadcrumb, …
│   │   ├── layout/         Header, Footer, Logo, A11Y toolbar, …
│   │   ├── sections/       Hero, QuickLinksTriad, WhyJoin, …
│   │   ├── decorative/     Divider, WaxSeal, EmblemMedallion, …
│   │   └── blocks/         InfoCard, Accordion, AlertBox, HubPage, ErrorPage, …
│   ├── pages/              Astro routing
│   │   ├── index.astro     / → /cs/ (instant redirect, fallback)
│   │   ├── 404.astro       Root 404 (CS only)
│   │   └── [lang]/         Per-jazyk routes
│   ├── layouts/
│   │   └── BaseLayout.astro Hlavní layout s <head>, JSON-LD, A11Y init
│   ├── scripts/
│   │   ├── header.ts       Megamenu hover + scroll behavior
│   │   ├── accessibility.ts A11Y toolbar (theme, font size, …)
│   │   ├── rules.ts        Pravidla — search + audience filter + scrollspy
│   │   └── toc-spy.ts      Sticky TOC scroll spy
│   └── styles/
│       └── global.css      Tailwind + design tokeny + a11y overrides
├── public/
│   ├── .htaccess           Apache config (HTTPS, cache, Brotli, HSTS)
│   ├── fonts/              Self-hosted woff2 (Sora, Cormorant, Source Sans 3)
│   ├── images/             Optimalizované WebP / AVIF
│   ├── favicon.svg
│   ├── robots.txt
│   └── llms.txt            Strojově čitelný přehled (llmstxt.org)
├── scripts/                One-shot utility skripty (audit, migrace)
├── docs/
│   ├── HANDOFF-v2.1.md     ← tento soubor
│   ├── cms-status.md       Auto-generovaný stav CMS-ready stránek
│   ├── translation-status.md Auto-generovaný stav překladů
│   ├── i18n-status.md      Historie i18n práce
│   └── audit/              Audit dokumenty
└── VERSION.md              Changelog
```

### Co kde je uloženo (jednotný systém)

| Typ obsahu | Formát | Cesta | Volá se přes |
|---|---|---|---|
| Krátké UI texty (sdílené) | JSON | `src/i18n/ui/{lang}.json` | `t('key')` |
| Per-page strukturovaný obsah | JSON | `src/content/pages/{slug}/{lang}.json` | `getPageData<T>('slug', lang)` nebo `tp(key)` |
| Per-page long-form text | Markdown | `src/content/pages-long/{slug}/{lang}.md` | `getEntry('longPages', 'slug/lang')` + `<Content />` |
| Sdílená data o akci | JSON | `src/content/site/event/{lang}.json` + `meta.json` | `getEvent(lang)` |
| Armády (lore data) | YAML | `src/content/factions/{slug}.yml` | `getCollection('factions')` |
| Novinky / blog | Markdown | `src/content/news/{lang}/{date}-{slug}.md` | `getCollection('news')` |
| FAQ data | TS | `src/data/faq.ts` | `getFaqGroups(lang)` |
| Megamenu data | TS | `src/data/navigation.ts` | `mainNavigation` |

---

## i18n (5 jazyků)

- **cs** — primární, plně přeložený (zdroj pravdy)
- **en, de, sk, uk** — UI shell přeložený, lore obsah u některých stránek zatím CS placeholder + lang_notice

URL struktura: `/cs/`, `/en/`, `/de/`, `/sk/`, `/uk/`. Default `/` přesměrovává na `/cs/` přes `.htaccess`.

Per-stránka × per-jazyk auditní reporty:
- `docs/cms-status.md` — má daná stránka per-page JSON / Markdown?
- `docs/translation-status.md` — kolik klíčů je shodných s CS (= placeholder) vs. odlišných (= přeložených)

Regenerace:
```bash
node --experimental-strip-types scripts/generate-cms-status.mjs
node --experimental-strip-types scripts/generate-translation-status.mjs
```

---

## Performance / SEO (v2.1)

### Self-hosted fonty
- `public/fonts/` — woff2 verze Sora, Cormorant Garamond, Source Sans 3
- `public/fonts/fonts.css` — `@font-face` deklarace (latin + latin-ext)
- Atkinson Hyperlegible (A11Y readable) lazy-loaded jen na toggle

### Hero — mobile-friendly
- Static poster (`public/images/hero-poster*.webp`) jako LCP element
- Responsive `<picture>` (small varianta pro mobile)
- YouTube iframe se na mobile NEZAPÍNÁ (úspora ~1+ MB)
- Save-data hint + slow connection detection respektovány
- Fade-in z poster na video po načtení

### .htaccess (`public/.htaccess`)
- HTTPS forcing (R=301)
- Root → /cs/ (R=301, instant)
- HSTS `max-age=31536000; includeSubDomains`
- Brotli (`mod_brotli`) + gzip fallback
- 1-rok cache pro hashed assets (immutable)
- 5-min cache pro HTML
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, COOP)
- ErrorDocument 404/500/403

### Image optimalizace
- Všechny `<img>` mají `width` + `height` (CLS 0)
- `loading="lazy"` + `decoding="async"` mimo above-fold
- WebP formát v `/images/`
- Hero poster `fetchpriority="high"`

### Schema.org JSON-LD
- `Organization` (vždy)
- `WebPage` (vždy)
- `BreadcrumbList` (když má drobečky)
- `Event` (jen na úvodní stránce)
- `FAQPage` (na /faq/)
- `NewsArticle` (na /novinky/{slug}/)

---

## Hosting + Deploy

### WebGlobe SFTP
- **Server:** `62.109.151.48` port `222`
- **DEV:** `dev.panprstenu.cz` (jail `/home/html/panprstenu.cz/_sub/dev/`)
- **NEW:** `new.panprstenu.cz` (jail `/home/html/panprstenu.cz/_sub/new/`)
- Hesla: GitHub Secrets (NEVER v repu)
- DNS Switch v den D: `panprstenu.cz` → NEW

### CI/CD
- **`.github/workflows/deploy-staging.yml`** — push do `staging` → DEV
- **`.github/workflows/deploy-production.yml`** — push do `main` → NEW (s `noindex`)
- lftp `mirror -R --delete --parallel=2` přes SFTP/222 (3 retry pokusy)

### Branche
- **`main`** — production (NEW), branch protection rule (PR only)
- **`staging`** — DEV (auto-deploy)
- **`feature/*`** — vývoj

### Verzování
- **v2.1.0** (2026-05-04) — Performance + Schema.org + self-hosted fonts + hero poster
- **v2.0.0** (2026-05-04) — CMS-ready architektura, plně externalizované texty
- **v1.0** (2026-04-29) — MVP foundation

---

## Audit kódu (2026-05-04)

### Konzistence

✅ **OK:**
- Všechny `.astro` komponenty psané jako Astro (žádný React/Svelte mix)
- Path aliasy konzistentní napříč repem (`@components/`, `@layouts/`, `@i18n/`, `@data/`, `@content/`, `@lib/`, `@scripts/`)
- TypeScript strict režim (`extends astro/tsconfigs/strict`)
- Komentáře v češtině s `Datum: YYYY-MM-DD` headerem
- i18n všude přes `t()` (ui.ts) nebo `tp()` (per-page)
- 0 hardcoded CS textů (po v2.0 migraci)

🟡 **Drobnosti, ne blokátory:**
- `src/i18n/ui.ts` (71 řádků) je tenký loader — JSON dictionaries mají 2400+ klíčů. Funkční, ale velký.
- `src/data/faq.ts` má 1167 řádků — TS modul s velkou strukturou. Mohl by se rozdělit do `src/content/faq/{lang}.json`, ale aktuálně používá dynamic L() pro cross-page odkazy.
- `src/data/event.ts` má `@deprecated` export pro CS-only `event` const (backward-compat); aktivně se používá pouze přes `getEvent(lang)`.

❌ **Problémy:** Žádné nalezené.

### Špageti / mrtvý kód

- **0 nepoužívaných komponent** ověřeno přes grep importů
- **0 nepoužívaných scriptů** v `src/scripts/` (každý import v alespoň 1 .astro)
- Helper soubory `scripts/audit-pages.mjs`, `extract-ui-to-json.mjs`, `migrate-page-to-json.mjs`, `migrate-factions-i18n.mjs`, `generate-cms-status.mjs`, `generate-translation-status.mjs`, `audit-links.py`, `audit-typography.py`, `extract-texts.py` jsou one-shot utility — ponechány pro budoucí potřebu (audit, regenerace).
- Python skripty (audit-links, audit-typography, extract-texts) volné nástroje — používané ad-hoc.

### Strom souborů — odstraněno
- `.DS_Store` files (macOS noise)
- `.gitignore` rozšířen o `grafika/` (lokální pracovní zdroje, .ai/.psd/.docx)
- `.gitignore` rozšířen o `**/.DS_Store`

### Velikosti
- `src/` — 38k řádků celkem (zdrojový kód)
- `public/fonts/` — 668 KB (27 woff2 souborů)
- `public/images/` — 4.5 MB (optimalizované WebP)
- `node_modules/` — 231 MB
- `dist/` (build) — 50 MB
- `grafika/` — 245 MB (lokálně, ne v gitu)

---

## Rozšiřitelnost — kde co přidat

| Akce | Kde |
|---|---|
| **Přidat novou stránku** | 1. `src/pages/[lang]/{slug}/index.astro` (route) 2. `src/content/pages/{slug}/{lang}.json` (5 jazyků) 3. Případně přidat do `src/data/navigation.ts` (megamenu) |
| **Upravit text na existující stránce** | `src/content/pages/{slug}/{lang}.json` nebo `src/content/pages-long/{slug}/{lang}.md` |
| **Přidat novou armádu** | `src/content/factions/{slug}.yml` s i18n bloky |
| **Přidat novinku** | `src/content/news/{lang}/{date}-{slug}.md` |
| **Přidat sdílený UI text** | `src/i18n/ui/{lang}.json` (5 jazyků pod stejným klíčem) |
| **Změnit megamenu** | `src/data/navigation.ts` (HubPage automaticky reflektuje) |
| **Změnit tematické tokeny (barvy, fonty)** | `src/styles/global.css` `@theme` direktiva |

---

## Plánované úkoly (v2.2+)

### High priority
- [ ] **Přeložit lore data armád** — aktuálně `i18n.{en,de,sk,uk}.{combat_style,ruler,lore_sections,…}` jsou kopie CS (placeholder). Reálné překlady jsou samostatný úkol.
- [ ] **Migrace `src/data/faq.ts` → `src/content/faq/{lang}.json`** — pro plnou CMS-readiness FAQ.
- [ ] **Migrace `src/data/navigation.ts` → JSON** — aby Sveltia / Directus mohlo editovat menu.

### Medium priority
- [ ] **Hero LCP optimalizace** — místo YouTube embed lokální video (loop) v MP4/WebM s posterem (eliminuje YouTube CDN dependency).
- [ ] **Critical CSS inlining** — Astro `inlineStylesheets: 'always'` (pozor na velikost první HTML).
- [ ] **AVIF formát obrázků** — vedle WebP, jako `<source type="image/avif">` v `<picture>`.
- [ ] **Service Worker** — offline fallback pro klíčové stránky.

### Low priority / nice to have
- [ ] **CMS** (Sveltia / Decap) — připravená infrastruktura, jen propojit.
- [ ] **Search v rámci celého webu** (Pagefind / Lunr).
- [ ] **A/B testing klíčových CTA** přes Cloudflare Workers.

---

## Kontakty + odpovědnosti

| Role | Osoba | E-mail |
|---|---|---|
| Hlavní organizátor / web owner | Michal Truhlář | info@panprstenu.cz / info@jrdm.cz |
| Pořadatel | Moravian LARP, z. s. | info@panprstenu.cz |

---

## Audit reports k dispozici

V `docs/`:
- `cms-status.md` — auto-generovaný stav CMS-ready (last update: 2026-05-04)
- `translation-status.md` — auto-generovaný stav překladů per jazyk × stránka
- `i18n-status.md` — historie překladové práce (manuální log)
- `audit/checklist-externalizace-stranek.md` — checklist hardcoded → externalizováno
- `audit/stav-externalizace.md` — stav migrace na CMS-ready architekturu
- `audit/navrh-externalizace-textu.md` — návrh externalizace textů (zdrojový plán)
- `audit/odkazy-audit.md` — audit interních odkazů
- `audit/typografie-audit.md` — audit typografie a WCAG
- `audit/sitemap.md` — sitemap struktura
- `audit/texty.md` — extrakce všech textů z webu (před migrací)
- `audit/i18n-handoff-2026-05-03.md` — handoff i18n práce

---

**Tento soubor** — `docs/HANDOFF-v2.1.md` — je primární zdroj informací o stavu projektu pro další práci. Pro rychlý changelog viz `VERSION.md`.
