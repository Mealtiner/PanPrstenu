# Verze 2.1

**Datum:** 2026-05-04
**Build:** 302 stránek (47 logických × 5 jazyků + 67 dynamických tras)

## Highlights v2.1

### Performance optimalizace (PageSpeed Insights)
- **Explicit `width` + `height`** na všech `<img>` tagech (CLS prevence)
- **Atkinson Hyperlegible font** se načítá pouze když uživatel zapne A11Y readable-font toggle (úspora ~25 KB blokujícího CSS pro 99 % návštěvníků)
- **Preconnect na YouTube** jen na úvodní stránce (kde je hero video)
- **`color-scheme: dark` na `<html>`** — browser-native dark first paint, žádný bílý flash před načtením CSS

### .htaccess upgrades
- **Brotli komprese** (vedle gzip) — lepší kompresní poměr pro web texty
- **HSTS header** — `max-age=31536000; includeSubDomains` (vynucené HTTPS po dobu 1 roku)
- **Cross-Origin-Opener-Policy** — izolace top-level browsing context
- **Server-pushed Link headers** — preload pro klíčové fonty
- **AddCharset UTF-8** explicitně pro JS/CSS/JSON/SVG/XML
- **Disable ETag** — preferujeme Last-Modified + Cache-Control

### Schema.org rozšíření
- `NewsArticle` schema na detail novinky (Google rich results)
- `Event` má organizer, image, geo, offers, audience
- `Organization`, `WebPage`, `BreadcrumbList`, `FAQPage` (FAQ stránka)

### llms.txt
- Aktualizováno o 5 jazyků (přidána UK), hub stránky, schema.org info, version log

---

# Verze 2.0

**Datum:** 2026-05-04
**Build:** 302 stránek (47 logických × 5 jazyků + 67 dynamických tras)

## Highlights v2.0

### CMS-ready architektura
- **51/55** stránek 🟢 ready (texty plně externalizované)
- **0** stránek s hardcoded texty
- 3 jednotné formáty pro správce:
  - `src/i18n/ui/{lang}.json` — sdílené UI texty (nav, common, footer, breadcrumbs)
  - `src/content/pages/{slug}/{lang}.json` — strukturované per-page obsahy
  - `src/content/pages-long/{slug}/{lang}.md` — long-form markdown (legal stránky)
- Plně i18n napříč 5 jazyky (cs/en/de/sk/uk)

### Nové stránky
- 4 hub stránky (rozcestníky odpovídající megamenu): `/hra-a-svet/`, `/prakticky/`, `/komunita/`, `/spoluprace/`
- Per-lang error stránky: 404, 500, 403 s tolkienovskými citáty
- Top-level mega items v menu jsou nyní klikací (split-design: text + šipka)

### Externalizace textů
- Migrováno na per-page JSON: 28 stránek (svet-stredozeme, role/, prakticke-info, …)
- Migrováno na markdown: 5 legal/info stránek (cookies, gdpr, podminky, pravidla, pro-novacky)
- Faction YAMLs: schema upgrade na full i18n (lore_sections, ruler, combat_style, …)
- Sidebar (FactionRolesSidebar) plně lokalizován

### UX vylepšení
- Hover megamenu: split-design klikatelný odkaz + dropdown bez bugů
- Root redirect: instant 301 přes `.htaccess` + custom fallback HTML (žádný 2-sec bílý blesk)
- HTTPS forcing, security headers, gzip komprese, 1-rok asset cache (přes `.htaccess`)

### Reporty pro CMS
- `docs/cms-status.md` — stav CMS-ready stránek (auto-generovaný)
- `docs/translation-status.md` — per-jazyk × per-stránka stav překladu
- `scripts/generate-cms-status.mjs`
- `scripts/generate-translation-status.mjs`
- `scripts/audit-pages.mjs` — pages audit

### Změny v repu
- `src/content.config.ts` — rozšířené schema pro `factions`, `pages`, `pages-long`
- `src/lib/content/pages.ts` — `getPageData()` + `getPageContent()` helpery
- `src/data/event.ts` — refactor na typed loader z `src/content/site/event/{lang}.json`
- `src/i18n/ui.ts` — refactor na JSON-based loader (předtím 13k řádků TypeScript object)

## Předchozí milník
**v1.0** (2026-04-29) — MVP foundation: Astro 6.1 + Tailwind 4 + Node 22.22.2 + i18n pro 4→5 jazyků + Header/Footer/Hero + první stránky.
